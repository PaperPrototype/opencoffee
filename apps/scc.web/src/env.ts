import { defineEnvVars } from '@sveltejs/kit/env';

const optional = (value: string | undefined) => value || undefined;

export const variables = defineEnvVars({
	PUBLIC_SUPABASE_URL: {
		public: true,
		static: true,
		description: 'Supabase API URL shared by every site (local: `pnpm db:status` → API_URL).'
	},
	PUBLIC_SUPABASE_PUBLISHABLE_KEY: {
		public: true,
		static: true,
		description: 'Supabase publishable key; safe in the browser (local: `pnpm db:status` → PUBLISHABLE_KEY).'
	},
	SUPABASE_SECRET_KEY: {
		description:
			'Supabase secret key (bypasses RLS). Server-only; used for orders, tickets and Stripe sync (local: `pnpm db:status` → SECRET_KEY).'
	},
	STRIPE_SECRET_KEY: {
		description: 'Stripe secret key for the platform account (sk_test_… / sk_live_…). Connect must be enabled.'
	},
	STRIPE_WEBHOOK_SECRET: {
		schema: optional,
		description:
			'Signing secret of the webhook endpoint for platform events (/api/stripe/webhook). Local: `stripe listen --forward-to localhost:5180/api/stripe/webhook`.'
	},
	SMTP_URL: {
		schema: optional,
		description:
			'SMTP server for ticket emails, e.g. smtps://user:pass@smtp.resend.com:465. Local: smtp://127.0.0.1:55325 (Mailpit). Unset = emails are logged, not sent.'
	},
	EMAIL_FROM: {
		schema: (value) => value || 'Specialty Coffee Community <events@specialtycoffeecommunity.com>',
		description: 'From address for ticket emails. Must be a sender your SMTP provider has verified.'
	},
	STRIPE_CONNECT_WEBHOOK_SECRET: {
		schema: optional,
		description:
			'Signing secret of the Connect webhook endpoint (events from connected accounts, e.g. account.updated). Optional; same URL.'
	}
});
