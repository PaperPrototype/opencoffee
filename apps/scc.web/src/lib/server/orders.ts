import { sendHostPaymentsReady, sendOrderConfirmation, sendOrderVoided } from '#lib/server/email.js';
import { stripe, type Stripe } from '#lib/server/stripe.js';
import { supabaseAdmin } from '#lib/server/supabase-admin.js';

const paymentIntentId = (pi: string | { id: string } | null | undefined) => (typeof pi === 'string' ? pi : (pi?.id ?? null));

/**
 * Complete the order behind a paid Checkout Session, issue its tickets and email them.
 * Idempotent, so both the webhook and the buyer's return page can call it.
 * If the event was cancelled while the buyer was paying, the payment is refunded instead.
 */
export async function fulfillCheckoutSession(session: Stripe.Checkout.Session, origin: string) {
	const orderId = session.metadata?.order_id ?? session.client_reference_id;
	if (!orderId || session.payment_status !== 'paid') return false;
	const paymentIntent = paymentIntentId(session.payment_intent);

	const { error } = await supabaseAdmin.rpc('complete_order', {
		p_order_id: orderId,
		p_payment_intent_id: paymentIntent ?? undefined
	});

	if (error?.code === 'P0003') {
		// Event cancelled mid-checkout: give the money back and record the order as refunded.
		await supabaseAdmin.from('orders').update({ stripe_payment_intent_id: paymentIntent }).eq('id', orderId);
		await refundOrder({ id: orderId, total: session.amount_total ?? 0, status: 'pending', stripe_payment_intent_id: paymentIntent }, origin, 'event_cancelled');
		return false;
	}
	if (error) throw new Error(`complete_order(${orderId}): ${error.message}`);

	await sendOrderConfirmation(orderId, origin);
	return true;
}

/** Close a Checkout Session so it can't be paid any more (no-op if it's already closed). */
async function expireCheckout(sessionId: string | null) {
	if (!sessionId) return;
	try {
		await stripe().checkout.sessions.expire(sessionId);
	} catch {
		// Already expired or completed — nothing to do.
	}
}

/** Release a pending order's held tickets (checkout abandoned, superseded or failed) and close its checkout. */
export async function expireOrder(orderId: string) {
	const { data } = await supabaseAdmin
		.from('orders')
		.update({ status: 'expired', expires_at: null })
		.eq('id', orderId)
		.eq('status', 'pending')
		.select('stripe_checkout_session_id');
	await expireCheckout(data?.[0]?.stripe_checkout_session_id ?? null);
}

/** Expire every open checkout a buyer has for an event (before they start a new one). */
export async function expireOpenOrders(userId: string, eventId: string) {
	const { data } = await supabaseAdmin.from('orders').select('id').eq('user_id', userId).eq('event_id', eventId).eq('status', 'pending');
	await Promise.all((data ?? []).map((o) => expireOrder(o.id)));
}

/**
 * Refund (paid) or cancel (free) an order and void its tickets, then tell the buyer.
 * Paid refunds pull the money back from the host (reverse_transfer) and return the platform fee.
 */
export async function refundOrder(
	order: { id: string; total: number; status: string; stripe_payment_intent_id: string | null },
	origin: string,
	reason: 'host' | 'event_cancelled' | 'refund' = 'host'
) {
	if (order.total > 0 && order.status !== 'refunded') {
		if (!order.stripe_payment_intent_id) throw new Error('This order has no Stripe payment to refund.');
		await stripe().refunds.create(
			{
				payment_intent: order.stripe_payment_intent_id,
				reverse_transfer: true,
				refund_application_fee: true,
				metadata: { order_id: order.id }
			},
			{ idempotencyKey: `refund-${order.id}` }
		);
	}
	await voidOrder(order.id, order.total > 0, origin, reason);
}

/** Void an order's tickets; the caller that actually changed it sends the email. */
export async function voidOrder(orderId: string, refunded: boolean, origin: string, reason: 'host' | 'event_cancelled' | 'refund') {
	const { data: changed, error } = await supabaseAdmin.rpc('void_order', { p_order_id: orderId, p_refunded: refunded });
	if (error) throw new Error(error.message);
	if (changed) await sendOrderVoided(orderId, origin, reason);
}

/**
 * Pull a connected account's current state from Stripe into hosts. Called from the account.updated
 * webhook and whenever a host opens their dashboard. The call that flips the account to "can receive
 * ticket money" emails the host once.
 */
export async function syncStripeAccount(account: Stripe.Account, origin: string) {
	const transfers = account.capabilities?.transfers === 'active';
	const payouts = account.payouts_enabled ?? false;
	const submitted = account.details_submitted ?? false;

	if (transfers) {
		const { data: flipped } = await supabaseAdmin
			.from('hosts')
			.update({ stripe_transfers_enabled: true, stripe_payouts_enabled: payouts, stripe_details_submitted: submitted })
			.eq('stripe_account_id', account.id)
			.eq('stripe_transfers_enabled', false)
			.select('user_id, name');
		if (flipped?.length) await sendHostPaymentsReady(flipped[0].user_id, flipped[0].name, origin);
	}
	await supabaseAdmin
		.from('hosts')
		.update({ stripe_transfers_enabled: transfers, stripe_payouts_enabled: payouts, stripe_details_submitted: submitted })
		.eq('stripe_account_id', account.id);
}
