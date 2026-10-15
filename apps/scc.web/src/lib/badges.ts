/** Early-member badges, awarded by member number (see the member_badge() SQL function). */

export type BadgeId = 'founding_10' | 'first_100' | 'first_1000';

export type Badge = {
	id: BadgeId;
	/** Highest member number that earns it. */
	limit: number;
	label: string;
	/** Celebration line: "You're one of …". */
	blurb: string;
	/** Tailwind classes for the badge's fill and text (theme colors). */
	tone: string;
};

export const badges: Badge[] = [
	{ id: 'founding_10', limit: 10, label: 'Founding 10', blurb: 'one of the ten founding members', tone: 'bg-secondary text-espresso' },
	{ id: 'first_100', limit: 100, label: 'First 100', blurb: 'one of the first hundred members', tone: 'bg-primary text-primary-content' },
	{ id: 'first_1000', limit: 1000, label: 'First 1,000', blurb: 'one of the first thousand members', tone: 'bg-accent text-accent-content' }
];

export const badgeById = (id: string | null | undefined) => badges.find((b) => b.id === id) ?? null;

/** The badge a member number earns (mirrors member_badge() in SQL). */
export const badgeFor = (memberNumber: number) => badges.find((b) => memberNumber <= b.limit) ?? null;

export const formatMemberNumber = (n: number) => `#${n.toLocaleString('en-US')}`;
