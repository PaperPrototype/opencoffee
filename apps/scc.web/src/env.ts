import { defineEnvVars } from '@sveltejs/kit/env';

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
	}
});
