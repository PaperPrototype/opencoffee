/**
 * Money is stored as integers in the currency's minor unit (cents), like Stripe.
 * Zero-decimal currencies (JPY, KRW) have no minor unit: ¥1500 is stored as 1500.
 */

type Currency = {
	label: string;
	/** Digits after the decimal point. */
	decimals: 0 | 2;
	/** Fixed part of the platform fee per paid ticket, in minor units. */
	feeFixed: number;
	/** Most the platform takes on any single ticket, in minor units. */
	feeCap: number;
};

export const currencies = {
	usd: { label: 'USD — US dollar', decimals: 2, feeFixed: 30, feeCap: 995 },
	cad: { label: 'CAD — Canadian dollar', decimals: 2, feeFixed: 30, feeCap: 995 },
	eur: { label: 'EUR — Euro', decimals: 2, feeFixed: 25, feeCap: 895 },
	gbp: { label: 'GBP — British pound', decimals: 2, feeFixed: 20, feeCap: 795 },
	aud: { label: 'AUD — Australian dollar', decimals: 2, feeFixed: 30, feeCap: 1495 },
	nzd: { label: 'NZD — New Zealand dollar', decimals: 2, feeFixed: 30, feeCap: 1495 },
	jpy: { label: 'JPY — Japanese yen', decimals: 0, feeFixed: 40, feeCap: 1500 },
	krw: { label: 'KRW — South Korean won', decimals: 0, feeFixed: 400, feeCap: 13000 }
} satisfies Record<string, Currency>;

export type CurrencyCode = keyof typeof currencies;

export const isCurrency = (code: string): code is CurrencyCode => code in currencies;

const info = (code: string): Currency => currencies[code as CurrencyCode] ?? currencies.usd;

/**
 * The platform's cut of each paid ticket: 3.5% + a few cents, capped. Free tickets are always free.
 * Prices are all-in — the buyer pays the listed price and this comes out of the host's payout
 * (as the Stripe application fee). With destination charges Stripe's own processing fee is paid
 * by the platform out of this amount.
 */
export const FEE_PERCENT = 3.5;

export function ticketFee(price: number, currency: string) {
	if (price <= 0) return 0;
	const { feeFixed, feeCap } = info(currency);
	return Math.min(Math.round((price * FEE_PERCENT) / 100) + feeFixed, feeCap, price);
}

/** Platform fee for a whole order: the per-ticket fee summed over every paid seat. */
export function orderFee(items: { price: number; quantity: number }[], currency: string) {
	return items.reduce((sum, { price, quantity }) => sum + ticketFee(price, currency) * quantity, 0);
}

export function formatMoney(amount: number, currency: string, { free = true } = {}) {
	if (free && amount === 0) return 'Free';
	const { decimals } = info(currency);
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: currency.toUpperCase(),
		minimumFractionDigits: amount % 10 ** decimals === 0 ? 0 : decimals,
		maximumFractionDigits: decimals
	}).format(amount / 10 ** decimals);
}

/** "12.50" → 1250 (or 12 for zero-decimal currencies, rounding). Returns null when not a valid amount. */
export function parseMoney(input: string, currency: string): number | null {
	const cleaned = input.replace(/[^\d.]/g, '');
	if (cleaned === '') return 0;
	const value = Number(cleaned);
	if (!Number.isFinite(value) || value < 0) return null;
	return Math.round(value * 10 ** info(currency).decimals);
}

/** 1250 → "12.50", for form inputs. */
export function toMajor(amount: number, currency: string) {
	const { decimals } = info(currency);
	return (amount / 10 ** decimals).toFixed(decimals);
}
