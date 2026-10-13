/**
 * Coffee avatar icons, drawn for this project on a 48×48 grid.
 * Stroked with currentColor (2.5px, round joins); `fill` marks shapes that are solid.
 * The `id` is what's stored in profiles.avatar_icon, so never rename or reuse one.
 */
export type AvatarIcon = { id: string; label: string; body: string };

export const avatarIcons: AvatarIcon[] = [
	{
		id: 'espresso',
		label: 'Espresso',
		body: `<path d="M13 21h20v7a9 9 0 0 1-9 9h-2a9 9 0 0 1-9-9z"/><path d="M33 23.5h2.5a3.5 3.5 0 0 1 0 7H32"/><path d="M9 41h28"/><path d="M19 15c0-2 2-2.5 2-4.5S19 8 19 6"/><path d="M26 15c0-2 2-2.5 2-4.5S26 8 26 6"/>`
	},
	{
		id: 'latte-art',
		label: 'Latte art',
		body: `<circle cx="22" cy="24" r="15"/><circle cx="22" cy="24" r="10.5"/><path d="M37 24h5"/><path fill="currentColor" stroke="none" d="M22 31.5c-5.2-3.3-7.4-6-7.4-8.6a3.7 3.7 0 0 1 7.4-.7 3.7 3.7 0 0 1 7.4.7c0 2.6-2.2 5.3-7.4 8.6z"/>`
	},
	{
		id: 'bean',
		label: 'Coffee bean',
		body: `<ellipse cx="24" cy="24" rx="11" ry="16" transform="rotate(35 24 24)"/><path d="M15.6 33.4c4.8-2.6 3.9-7.8 7.2-10.6s7.7-2.4 9.6-6.2"/>`
	},
	{
		id: 'cherries',
		label: 'Coffee cherries',
		body: `<circle cx="18" cy="31" r="8"/><circle cx="31" cy="29" r="7"/><path d="M18 23c1-6 5-10 11-12"/><path d="M31 22c0-4-.6-7.5-2-11"/><path fill="currentColor" stroke="none" d="M29 11c3.5-4 9-5 12.5-2.5-3 4-8.5 5-12.5 2.5z"/><circle cx="15.5" cy="28.5" r="1.4" fill="currentColor" stroke="none"/>`
	},
	{
		id: 'pour-over',
		label: 'Pour-over',
		body: `<path d="M11 12h26l-9 13h-8z"/><path d="M8 12h32"/><path d="M20 25h8v3h-8z"/><path d="M16 31h16l2 9H14z"/><path d="M24 4v4"/><path d="M17.5 17h13"/>`
	},
	{
		id: 'moka-pot',
		label: 'Moka pot',
		body: `<path d="M16 10h16l-2.5 12h-11z"/><path d="M17 22h14l3 18H14z"/><path d="M14.5 26.5h19"/><path d="M32 12.5l6 2v8.5l-7.5 2"/><path d="M21 7h6"/><path d="M16 10l-3 2.5"/>`
	},
	{
		id: 'french-press',
		label: 'French press',
		body: `<path d="M14 15h17v22a3 3 0 0 1-3 3H17a3 3 0 0 1-3-3z"/><path d="M11 15h23"/><path d="M22.5 15V6"/><path d="M19 6h7"/><path d="M14 23h17"/><path d="M31 19h3.5a2.5 2.5 0 0 1 2.5 2.5v9a2.5 2.5 0 0 1-2.5 2.5H31"/>`
	},
	{
		id: 'portafilter',
		label: 'Portafilter',
		body: `<path d="M6 18h24v3a9 9 0 0 1-9 9h-6a9 9 0 0 1-9-9z"/><path d="M30 21l11 7.5"/><path d="M38.5 26.8l3.6 2.5" stroke-width="5"/><path d="M14 30v5"/><path d="M22 30v5"/><path d="M14 39.5v.5M22 39.5v.5"/>`
	},
	{
		id: 'kettle',
		label: 'Gooseneck kettle',
		body: `<path d="M14 22h19l3 18H11z"/><path d="M18 22c0-4 2.5-6.5 5.5-6.5S29 18 29 22"/><path d="M23.5 15.5V13"/><path d="M12.5 27C7 27 5.5 20 3.5 15"/><path d="M33.5 24.5c5.5 0 6.5 10.5 1 12.5"/>`
	},
	{
		id: 'grinder',
		label: 'Hand grinder',
		body: `<path d="M17 12h14l-3 8h-8z"/><path d="M16 20h16v18a2 2 0 0 1-2 2H18a2 2 0 0 1-2-2z"/><path d="M24 12V6h11"/><circle cx="37.5" cy="6" r="2.5"/><path d="M16 30h16"/>`
	},
	{
		id: 'branch',
		label: 'Coffee branch',
		body: `<path d="M9 41C17 31 26 21 39 8"/><path fill="currentColor" stroke="none" d="M18 30c-6.5.5-11-3-12-9 6.5-.6 11 3 12 9z"/><path fill="currentColor" stroke="none" d="M28 19.5c.4-6.5 4.5-10.6 10.5-11-.4 6.5-4.5 10.6-10.5 11z"/><path fill="currentColor" stroke="none" d="M20 28c5.8 2.4 8 7.4 6.6 13.2-5.8-2.4-8-7.4-6.6-13.2z"/><circle cx="29" cy="25" r="3.2"/><circle cx="34" cy="22" r="3.2"/>`
	},
	{
		id: 'iced',
		label: 'Iced coffee',
		body: `<path d="M13 12h22l-3 28H16z"/><path d="M29 4l-4 18"/><rect x="17" y="21" width="7" height="7" rx="1.5" transform="rotate(-12 20.5 24.5)"/><rect x="23.5" y="27" width="7" height="7" rx="1.5" transform="rotate(10 27 30.5)"/><path d="M14.4 18h19.2"/>`
	},
	{
		id: 'cezve',
		label: 'Cezve',
		body: `<path d="M15 19l-2 17a4 4 0 0 0 4 4.5h11a4 4 0 0 0 4-4.5l-2-17"/><path d="M12 19h21l3-3"/><path d="M33 21l11-5.5"/><path d="M19 13c0-2 2-2.5 2-4.5M25 13c0-2 2-2.5 2-4.5"/>`
	},
	{
		id: 'chemex',
		label: 'Chemex',
		body: `<path d="M13 7h22l-9 16 9 15a2.5 2.5 0 0 1-2.2 3.8H15.2A2.5 2.5 0 0 1 13 38l9-15z"/><path fill="currentColor" stroke="none" d="M19.6 19.5h8.8l-1.6 3.5 1.6 3.5h-8.8l1.6-3.5z"/><path d="M17 34h14"/>`
	},
	{
		id: 'aeropress',
		label: 'AeroPress',
		body: `<path d="M17 17h14v19H17z"/><path d="M14 17h20"/><path d="M19.5 7h9v10h-9z"/><path d="M17.5 7h13"/><path d="M13 40h22"/><path d="M17 36l-2 4M31 36l2 4"/><path d="M17 26h14"/>`
	},
	{
		id: 'cupping',
		label: 'Cupping',
		body: `<path d="M8 25h26c0 8-5.5 14-13 14S8 33 8 25z"/><path d="M12 25c2-1.5 16-1.5 18 0"/><path d="M27 23L40 8"/><ellipse cx="25.5" cy="25" rx="3.6" ry="2.4" transform="rotate(-40 25.5 25)" fill="currentColor"/>`
	}
];

const byId = new Map(avatarIcons.map((icon) => [icon.id, icon]));

/** FNV-1a: a small, stable string hash for picking defaults. */
function hash(value: string) {
	let h = 0x811c9dc5;
	for (let i = 0; i < value.length; i++) {
		h ^= value.charCodeAt(i);
		h = Math.imul(h, 0x01000193);
	}
	return h >>> 0;
}

/**
 * The avatar to show: the member's pick, or — until they choose — a default derived from their
 * user id, so everyone starts with a distinct, stable avatar.
 */
export function resolveAvatar(
	userId: string,
	icon: string | null | undefined,
	hue: number | null | undefined
) {
	const h = hash(userId);
	return {
		icon: (icon && byId.get(icon)) || avatarIcons[h % avatarIcons.length],
		hue: hue ?? (h >>> 8) % 360
	};
}

/** Tile and ink colors for a hue; same lightness for every hue so no pick looks washed out. */
export const avatarColors = (hue: number) => ({
	background: `oklch(0.86 0.085 ${hue})`,
	ink: `oklch(0.33 0.075 ${hue})`
});
