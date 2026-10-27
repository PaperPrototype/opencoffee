/** Early-member badges, awarded by member number (see the member_badge() SQL function). */

export type BadgeId = 'first_100' | 'first_1000' | 'first_10000';

export type Badge = {
	id: BadgeId;
	/** Highest member number that earns it. */
	limit: number;
	label: string;
	/** Name printed on the medal. */
	title: string;
	/** Celebration line: "You're one of …". */
	blurb: string;
	/** Tailwind classes for the badge's fill and text (theme colors). */
	tone: string;
	/** Ink color for the medal (numeral, rings, rays). */
	ink: string;
};

export const badges: Badge[] = [
	{
		id: 'first_100',
		limit: 100,
		label: 'First 100',
		title: 'The Founding Hundred',
		blurb: 'one of the founding hundred members',
		tone: 'bg-secondary text-espresso',
		ink: '#d4a03a'
	},
	{
		id: 'first_1000',
		limit: 1000,
		label: 'First 1,000',
		title: 'The First Thousand',
		blurb: 'one of the first thousand members',
		tone: 'bg-primary text-primary-content',
		ink: '#c4572a'
	},
	{
		id: 'first_10000',
		limit: 10000,
		label: 'First 10,000',
		title: 'The First Ten Thousand',
		blurb: 'one of the first ten thousand members',
		tone: 'bg-accent text-accent-content',
		ink: '#66703c'
	}
];

export const badgeById = (id: string | null | undefined) => badges.find((b) => b.id === id) ?? null;

/** The badge a member number earns (mirrors member_badge() in SQL). */
export const badgeFor = (memberNumber: number) => badges.find((b) => memberNumber <= b.limit) ?? null;

export const formatMemberNumber = (n: number) => `#${n.toLocaleString('en-US')}`;

/** How far along each badge run is, given the latest member number claimed: #1–100, #101–1,000, #1,001–10,000. */
export const badgeRuns = (latest: number) =>
	badges.map((b, i) => {
		const from = i === 0 ? 1 : badges[i - 1].limit + 1;
		const claimed = Math.max(0, Math.min(latest, b.limit) - from + 1);
		const size = b.limit - from + 1;
		return { ...b, from, size, claimed, left: size - claimed };
	});
