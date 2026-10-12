// Demo content for the landing page, mirrored from the specialtycoffeecommunity.com pre-launch build.

export type TicketEvent = {
	slug: string;
	title: string;
	image: string;
	day: string;
	month: string;
	weekday: string;
	location: string;
	going: string;
	tags: string[];
	/** Shown in the ticket stub; "FREE" renders in olive. */
	price: string;
};

export const heroStack: TicketEvent[] = [
	{
		slug: 'new-york-coffee-festival-2026',
		title: 'New York Coffee Festival',
		image: '/img/event-festival-nyc.webp',
		day: '16',
		month: 'OCT',
		weekday: 'FRI · OCT 16',
		location: 'New York, NY',
		going: '2,140',
		tags: ['Festival', '3 days'],
		price: 'FROM $40'
	},
	{
		slug: 'tasting-at-ten',
		title: 'Tasting at Ten: Free Friday Cupping',
		image: '/img/event-tasting-ten.webp',
		day: '01',
		month: 'AUG',
		weekday: 'SAT · AUG 01',
		location: 'Chicago, IL',
		going: '28',
		tags: ['Cupping', 'Free'],
		price: 'FREE'
	},
	{
		slug: 'thursday-night-throwdown',
		title: 'Thursday Night Throwdown',
		image: '/img/hero-polaroid-throwdown.webp',
		day: '30',
		month: 'JUL',
		weekday: 'THU · JUL 30',
		location: 'New York, NY',
		going: '64',
		tags: ['Throwdown'],
		price: '$5'
	}
];

export const thisWeek: TicketEvent[] = [
	{
		slug: 'thursday-night-throwdown-october',
		title: 'Thursday Night Throwdown — October Edition',
		image: '/img/event-throwdown.webp',
		day: '01',
		month: 'OCT',
		weekday: 'THU · OCT 01',
		location: 'New York, United States',
		going: '158',
		tags: ['Throwdown'],
		price: 'FROM $0.00'
	},
	{
		slug: 'roast-summit-portland-2026',
		title: 'Roast Summit Portland 2026',
		image: '/img/guide-roast.webp',
		day: '01',
		month: 'OCT',
		weekday: 'THU · OCT 01',
		location: 'Portland, United States',
		going: '640',
		tags: ['Workshop'],
		price: 'FROM $249.00'
	},
	{
		slug: 'tasting-at-ten-public-cupping',
		title: 'Tasting at Ten — Friday Public Cupping',
		image: '/img/event-tasting-ten.webp',
		day: '02',
		month: 'OCT',
		weekday: 'FRI · OCT 02',
		location: 'New York, United States',
		going: '31',
		tags: ['Cupping'],
		price: 'FREE'
	},
	{
		slug: 'nyc-coffee-festival-2026',
		title: 'NYC Coffee Festival 2026',
		image: '/img/event-festival-nyc.webp',
		day: '03',
		month: 'OCT',
		weekday: 'SAT · OCT 03',
		location: 'New York, United States',
		going: '8,400',
		tags: ['Festival'],
		price: 'FROM $45.00'
	},
	{
		slug: 'barista-league-johannesburg',
		title: 'The Barista League: Johannesburg',
		image: '/img/event-barista-league.webp',
		day: '03',
		month: 'OCT',
		weekday: 'SAT · OCT 03',
		location: 'Johannesburg, South Africa',
		going: '520',
		tags: ['Competition'],
		price: 'FREE'
	},
	{
		slug: 'coffee-fest-dfw-2026',
		title: 'Coffee Fest Dallas–Fort Worth 2026',
		image: '/img/event-festival-nyc.webp',
		day: '17',
		month: 'OCT',
		weekday: 'SAT · OCT 17',
		location: 'Dallas–Fort Worth, United States',
		going: '2,900',
		tags: ['Festival'],
		price: 'FROM $25.00'
	}
];

export const festivals = [
	{
		title: 'NYC Coffee Festival 2026',
		image: '/img/event-festival-nyc.webp',
		where: 'OCT 03 · 100 Dobbin St, New York',
		blurb: 'One day, 100+ specialty roasters and coffee shops, live music and eats at 100 Dobbin St.',
		price: 'FROM $45.00',
		going: '8,400'
	},
	{
		title: 'Seoul Café Show 2026',
		image: '/img/event-seoul.webp',
		where: 'NOV 11–14 · COEX Convention Center, Halls A–D, Seoul',
		blurb:
			"Asia's largest café industry show, four days at COEX — and this year it hosts the world barista championship final.",
		price: 'FROM ₩250',
		going: '68,000'
	},
	{
		title: 'MICE — Melbourne International Coffee Expo 2027',
		image: '/img/event-festival-mice.webp',
		where: 'MAR 04–06 · Melbourne Convention & Exhibition Centre, Melbourne',
		blurb: "The Southern Hemisphere's premier coffee event returns to the MCEC.",
		price: 'FROM A$25.00',
		going: '26,000'
	}
];

export const moreFestivals = [
	'Seoul Café Show · Nov 11–14',
	'Tokyo Coffee Festival · This fall',
	'Berlin Coffee Week · Sep 14–20',
	'Amsterdam Coffee Festival · Apr 2027'
];

export const goingAvatars = ['maya', 'daniel', 'priya', 'kenji', 'leo'].map(
	(n) => `/img/avatar-${n}.webp`
);

export const threads = [
	{
		category: 'Brewing & Espresso',
		dot: 'bg-primary',
		title: 'Bitter espresso even at 1:2 in 28s — what am I missing?',
		author: 'Maya R.',
		avatar: '/img/avatar-maya.webp',
		replies: 47,
		status: 'solved'
	},
	{
		category: 'Green Coffee & Producers',
		dot: 'bg-accent',
		title: 'Ask me anything: I farm 3 hectares in Huila, Colombia',
		author: 'Tomás G.',
		avatar: '/img/avatar-tomas.webp',
		replies: 212,
		status: 'trending'
	},
	{
		category: 'Events & Meetups',
		dot: 'bg-ember',
		title: "Who's going to Berlin Coffee Week? Rideshare + meetup thread",
		author: 'Sofia M.',
		avatar: '/img/avatar-sofia.webp',
		replies: 96,
		status: 'new'
	}
] as const;

export const foundingClasses = [
	{
		name: 'The Founding 100',
		places: '100',
		blurb: 'names written into the ledger, permanently. The scarcest mark we will ever issue.'
	},
	{
		name: 'The First 1,000',
		places: '1,000',
		blurb: 'founding member badge + name in the founding registry.'
	},
	{
		name: 'The First 10,000',
		places: '10,000',
		blurb:
			'founding badge, permanent. When this community serves its first million people, 10,000 can say they were there at the beginning.'
	}
];

export const pledges = ['Free to join', 'Community-driven', 'Open knowledge'];
