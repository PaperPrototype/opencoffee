import { error, json } from '@sveltejs/kit';
import { STRIPE_CONNECT_WEBHOOK_SECRET, STRIPE_WEBHOOK_SECRET } from '$app/env/private';
import { expireOrder, fulfillCheckoutSession, syncStripeAccount, voidOrder } from '#lib/server/orders.js';
import { stripe, type Stripe } from '#lib/server/stripe.js';
import { supabaseAdmin } from '#lib/server/supabase-admin.js';
import type { RequestHandler } from './$types';

/**
 * Stripe webhook. Subscribe the platform endpoint to:
 *   checkout.session.completed, checkout.session.async_payment_succeeded,
 *   checkout.session.expired, charge.refunded
 * and (optionally, as a Connect endpoint with its own secret) account.updated.
 */
export const POST: RequestHandler = async ({ request, url }) => {
	const signature = request.headers.get('stripe-signature');
	if (!signature) error(400, 'Missing signature.');
	const body = await request.text();

	let event: Stripe.Event | undefined;
	for (const secret of [STRIPE_WEBHOOK_SECRET, STRIPE_CONNECT_WEBHOOK_SECRET]) {
		if (!secret) continue;
		try {
			event = await stripe().webhooks.constructEventAsync(body, signature, secret);
			break;
		} catch {
			// Try the next secret.
		}
	}
	if (!event) error(400, 'Invalid signature.');

	switch (event.type) {
		case 'checkout.session.completed':
		case 'checkout.session.async_payment_succeeded':
			await fulfillCheckoutSession(event.data.object, url.origin);
			break;

		case 'checkout.session.expired': {
			const orderId = event.data.object.metadata?.order_id;
			if (orderId) await expireOrder(orderId);
			break;
		}

		case 'charge.refunded': {
			// Full refunds, including ones made in the Stripe dashboard. Whichever of this and the refund
			// action voids the order first sends the email; the other is a no-op.
			const charge = event.data.object;
			const paymentIntent = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;
			if (charge.refunded && paymentIntent) {
				const { data: order } = await supabaseAdmin
					.from('orders')
					.select('id, events(status)')
					.eq('stripe_payment_intent_id', paymentIntent)
					.maybeSingle();
				if (order) await voidOrder(order.id, true, url.origin, order.events?.status === 'cancelled' ? 'event_cancelled' : 'refund');
			}
			break;
		}

		case 'account.updated':
			await syncStripeAccount(event.data.object);
			break;
	}

	return json({ received: true });
};
