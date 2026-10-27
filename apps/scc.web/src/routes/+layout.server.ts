import { badgeFor } from '#lib/badges.js';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { session, user, supabase }, cookies, depends }) => {
	depends('app:celebration');

	// A badge holder who hasn't seen their celebration yet gets confetti on whatever page they land on
	// (usually right after confirming their email).
	let celebration: { memberNumber: number; badge: string; name: string | null } | null = null;
	// The signed-in member, for the header's profile button.
	let me: { userId: string; memberNumber: number; name: string | null; avatarIcon: string | null; avatarHue: number | null } | null = null;
	if (user) {
		const { data: profile } = await supabase
			.from('profiles')
			.select('member_number, display_name, avatar_icon, avatar_hue, badge_celebrated_at')
			.eq('user_id', user.id)
			.maybeSingle();
		const badge = profile && !profile.badge_celebrated_at ? badgeFor(profile.member_number) : null;
		if (profile && badge) celebration = { memberNumber: profile.member_number, badge: badge.id, name: profile.display_name };
		if (profile)
			me = {
				userId: user.id,
				memberNumber: profile.member_number,
				name: profile.display_name,
				avatarIcon: profile.avatar_icon,
				avatarHue: profile.avatar_hue
			};
	}

	return { session, cookies: cookies.getAll(), celebration, me };
};
