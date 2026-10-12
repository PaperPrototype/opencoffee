// Simulated draw for the landing-page demo, mirrored from platform.worldespressochampionship.com.

export type Athlete = { name: string; country: string; photo?: string };

export type Heat = {
	id: string;
	station: 1 | 2;
	time: string;
	/** Seeded athletes for the first round; later rounds show "Winner of Hxx". */
	slots: [Athlete, Athlete] | [string, string];
};

const a = (name: string, country: string, photo?: string): Athlete => ({
	name,
	country,
	photo: photo && `/img/athletes/${photo}.webp`
});

const roundOf32: [Athlete, Athlete][] = [
	[a('Camille Moreau', 'FRA', 'a13'), a('Brian Kiptoo', 'KEN', 'a22')],
	[a('Marisol Vásquez', 'PAN'), a('Daan van der Berg', 'NED', 'a24')],
	[a('Aleksi Niemi', 'FIN', 'a12'), a('Mateo Sandoval', 'GTM', 'a16')],
	[a('Valentina Ríos', 'COL', 'a07'), a('Mārama Rangi', 'NZL', 'a25')],
	[a('Hanna Bekele', 'ETH', 'a11'), a('Callum Reeves', 'AUS', 'a02')],
	[a('Ji-woo Seo', 'KOR', 'a29'), a('Yuki Tanaka', 'JPN', 'a21')],
	[a('Beatriz Costa', 'POR', 'a28'), a('Lena Hartmann', 'AUT', 'a03')],
	[a('Emma Tremblay', 'CAN', 'a05'), a('Nikolaj Bruun', 'DEN', 'a10')],
	[a('Tereza Nováková', 'CZE', 'a09'), a('Wei Chen', 'CHN', 'a06')],
	[a('Eleni Papadakis', 'GRE', 'a15'), a('Marta Iglesias', 'ESP', 'a30')],
	[a('Paolo Quispe', 'PER', 'a27'), a('Cormac O’Brien', 'IRL', 'a19')],
	[a('Giulia Ferrero', 'ITA', 'a20'), a('Elsa Lindqvist', 'SWE', 'a31')],
	[a('Sigrún Árnadóttir', 'ISL', 'a18'), a('Lucía Herrera', 'HON', 'a17')],
	[a('Sofía Navarro', 'MEX', 'a23'), a('Jonas Weber', 'GER', 'a14')],
	[a('Diego Madrigal', 'CRC', 'a08'), a('Oliver Bennett', 'GBR', 'a32')],
	[a('Rafael Oliveira', 'BRA', 'a04'), a('Ingrid Solberg', 'NOR', 'a26')]
];

// prettier-ignore
const times = [
	'09:00:15', '09:00:15', '09:00:53', '09:00:53', '09:01:31', '09:01:31', '09:02:09', '09:02:09',
	'09:03:25', '09:02:47', '09:04:03', '09:03:25', '09:04:41', '09:04:03', '09:05:19', '09:04:41',
	'09:05:57', '09:05:19', '09:06:35', '09:05:57', '09:07:13', '09:06:35', '09:07:51', '09:07:13',
	'09:08:29', '09:07:51', '09:09:07', '09:08:41',
	'09:09:45', '09:09:57',
	'09:10:47'
];

const id = (n: number) => `H${String(n).padStart(2, '0')}`;

/** Rounds of 16, 8, 4, 2 and 1 heats; heat numbers run H01–H31 across the whole bracket. */
export const rounds: { name: string; heats: Heat[] }[] = (() => {
	const names = ['Round of 32', 'Round of 16', 'Quarterfinal', 'Semifinal', 'Final'];
	let n = 1;
	let feeder = 1;
	return names.map((name, r) => {
		const count = 16 >> r;
		const heats: Heat[] = Array.from({ length: count }, (_, i) => {
			const heat: Heat = {
				id: id(n),
				station: i % 2 === 0 ? 1 : 2,
				time: times[n - 1],
				slots: r === 0 ? roundOf32[i] : [`Winner of ${id(feeder)}`, `Winner of ${id(feeder + 1)}`]
			};
			if (r > 0) feeder += 2;
			n++;
			return heat;
		});
		return { name, heats };
	});
})();

export const nav = ['How it works', 'The draw', 'Athletes', 'Judges', 'The coffee', 'Celebration'];

export const categories = [
	{ name: 'Tactile', points: 15 },
	{ name: 'Taste', points: 10 },
	{ name: 'Flavour', points: 8 }
];
