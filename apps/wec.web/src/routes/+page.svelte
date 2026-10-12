<script lang="ts">
	import {
		ArrowRight,
		Bell,
		CalendarDays,
		CircleAlert,
		Coffee,
		Eye,
		Globe,
		MapPin,
		MessageSquare,
		Play,
		Route,
		Shield,
		Users
	} from '@lucide/svelte';
	import SiteFooter from '#lib/components/SiteFooter.svelte';
	import SiteNav from '#lib/components/SiteNav.svelte';

	const raised = 0;
	const goal = 100_000;

	const stats = [
		{ icon: Route, value: '4', label: 'Championships Held' },
		{ icon: Globe, value: '32', label: 'Countries Represented' },
		{ icon: CircleAlert, value: 'Ready', label: 'Next World Final', highlight: true },
		{ icon: Eye, value: '1', label: 'Blind Judging Format' }
	];

	const audiences = [
		{
			icon: Route,
			title: 'Competitors',
			image: '/img/home/barista1.webp',
			body: "National champions competing for the title in the world's most objective espresso competition — same coffee, same machine, only the barista differs.",
			cta: 'Championship Ready',
			tone: 'text-cinnamon-light bg-cinnamon/15'
		},
		{
			icon: Shield,
			title: 'Sponsors',
			image: '/img/home/coffee1.webp',
			body: "Partner with the world's most objective espresso competition. Opportunities for future events are open.",
			cta: 'Partner With Us',
			tone: 'text-accent bg-accent/15'
		},
		{
			icon: Users,
			title: 'Community',
			image: '/img/home/crowd1.webp',
			body: 'Judges, volunteers, spectators, and coffee lovers worldwide. Join the movement for transparent, objective coffee competitions.',
			cta: 'Get Involved',
			tone: 'text-success bg-success/15'
		}
	];

	// Two columns, filled top-to-bottom: one portrait + two landscape shots each, so they end level.
	const gallery = [
		{ src: '/img/home/barista2.webp', alt: 'A competitor reads the brief at the bar' },
		{ src: '/img/home/coffee1.webp', alt: 'Two winners with their trophies and prize cheque' },
		{ src: '/img/home/crowd2.webp', alt: 'The emcee talking with competitors' },
		{ src: '/img/home/trophy1.webp', alt: 'A competitor pulling shots at the grinder' },
		{ src: '/img/home/portrait1.webp', alt: 'Competitors celebrating together after the final' },
		{ src: '/img/home/stage1.webp', alt: 'A smiling barista at the espresso machine' }
	];
</script>

<svelte:head>
	<title>World Espresso Championship — Same coffee. Same machine. Only the barista differs.</title>
	<meta
		name="description"
		content="The world's most objective espresso competition. 32 national champions, blind judging, every score public. WEC 2027 World Final — Tokyo, 2 May 2027."
	/>
</svelte:head>

<SiteNav />

<main>
	<!-- Hero -->
	<section class="relative isolate overflow-hidden">
		<img src="/img/home/hero1.webp" alt="" class="absolute inset-0 -z-20 size-full object-cover" />
		<div class="absolute inset-0 -z-10 bg-linear-to-b from-espresso/80 via-espresso/70 to-espresso"></div>

		<div class="mx-auto flex min-h-[calc(100svh-7.5rem)] max-w-5xl flex-col items-center justify-center px-4 py-24 text-center">
			<span class="badge h-auto gap-2 border-cinnamon/50 bg-cinnamon/15 px-4 py-2 text-sm text-sand/90">
				<span class="size-1.5 rounded-full bg-cinnamon-light"></span> WEC 2027 — World Final, Tokyo
			</span>
			<h1 class="mt-8 text-[clamp(2rem,10.5vw,3rem)] leading-[0.95] font-black tracking-tight uppercase sm:text-7xl lg:text-8xl">
				The World<br />
				<span class="bg-linear-to-r from-sand via-accent to-cinnamon bg-clip-text text-transparent">Espresso</span><br />
				Championship
			</h1>
			<p class="mt-8 max-w-2xl text-lg leading-relaxed text-sand/80 sm:text-xl">
				Same coffee. Same machine. Only the barista differs.<br class="hidden sm:block" />
				The most objective competition in coffee. Winner takes a career — not just a trophy.
			</p>
			<div class="mt-10 flex flex-wrap justify-center gap-4">
				<a href="#partner" class="btn btn-lg rounded-lg btn-secondary px-8">
					Partner With Us <ArrowRight class="size-5" />
				</a>
				<a href="#fund" class="btn btn-lg rounded-lg border-sand/30 bg-espresso/40 px-8 text-sand btn-outline hover:bg-sand/10">
					Learn More
				</a>
			</div>

			<dl class="mt-16 grid w-full max-w-3xl grid-cols-2 gap-8 sm:grid-cols-4">
				{#each stats as stat (stat.label)}
					<div class="flex flex-col items-center gap-2">
						<stat.icon class="size-6 text-cinnamon-light" />
						<dd class="text-2xl font-bold {stat.highlight ? 'text-cinnamon-light' : ''}">{stat.value}</dd>
						<dt class="text-xs text-sand/55">{stat.label}</dt>
					</div>
				{/each}
			</dl>
		</div>
	</section>

	<!-- The fund -->
	<section id="fund" class="scroll-mt-24 border-y border-sand/10 bg-linear-to-b from-[#2a1d15] to-base-200 px-4 py-28 text-center">
		<p class="eyebrow text-cinnamon-light">The Fund</p>
		<p class="mt-8 text-5xl font-black whitespace-nowrap tabular-nums sm:text-8xl">
			<span class="text-cinnamon-light">{raised.toLocaleString('en-US')}</span>
			<span class="mx-2 font-light text-sand/30">/</span>
			{goal.toLocaleString('en-US')}
		</p>
		<progress class="progress mx-auto mt-8 h-2 w-full max-w-xl bg-sand/10 text-secondary" value={raised} max={goal}></progress>
		<p class="mt-6 text-xl text-sand/85">Tokyo, 2 May 2027</p>
		<p class="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-sand/55">
			100,000 = venue, 32 competitors' travel, coffee, judges, operations. Above the line goes to the 2028
			fund. The ledger is public. Every dollar shown is a dollar received.
		</p>
		<div class="mt-10 flex flex-wrap justify-center gap-4">
			<a href="#partner" class="btn rounded-lg btn-secondary px-6"><Shield class="size-4" /> Partner With Us</a>
			<a href="/" class="btn rounded-lg border-sand/20 bg-transparent px-6 text-sand btn-outline hover:bg-sand/10">
				<CircleAlert class="size-4" /> Read the Full Announcement
			</a>
		</div>
	</section>

	<!-- Ready -->
	<section class="px-4 py-28">
		<div class="mx-auto max-w-4xl text-center">
			<span class="badge h-auto gap-1.5 border-cinnamon/40 bg-cinnamon/10 px-3 py-1.5 text-sm text-sand/85">
				<CircleAlert class="size-3.5 text-cinnamon-light" /> Ready
			</span>
			<h2 class="mt-8 text-4xl font-extrabold tracking-tight sm:text-5xl">
				WEC 2027 Tokyo Is <span class="text-cinnamon-light">Ready</span>
			</h2>

			<div class="mt-12 grid gap-6 text-left md:grid-cols-2">
				<div class="card-board flex flex-col items-center p-8 text-center">
					<CircleAlert class="size-10 text-cinnamon-light" strokeWidth={1.5} />
					<h3 class="mt-4 text-xl font-bold text-cinnamon-light">Ready</h3>
					<p class="mt-3 text-[15px] leading-relaxed text-sand/75">
						WEC 2027 Tokyo is ready to run — gated by funding, not by talent, venues, or permission. When
						the fund hits 100,000, the championship proceeds.
					</p>
				</div>
				<div class="card-board flex flex-col items-center p-8 text-center">
					<Coffee class="size-10 text-accent" strokeWidth={1.5} />
					<h3 class="mt-4 text-xl font-bold text-accent">What We Are Building</h3>
					<p class="mt-3 text-[15px] leading-relaxed text-sand/75">
						Free Espresso Throwdown software. National Championship partnerships. A live open-scoring demo.
						The platform is live.
					</p>
					<a href="/" class="mt-auto pt-5 text-sm font-semibold text-cinnamon-light hover:text-sand">
						Read the full statement →
					</a>
				</div>
			</div>

			<div class="mt-10 flex flex-wrap justify-center gap-4">
				<a href="/" class="btn btn-lg rounded-lg btn-secondary px-7"><CircleAlert class="size-5" /> Read the Statement</a>
				<a href="/platform" class="btn btn-lg rounded-lg btn-accent px-7"><Play class="size-5" /> Try the Live Demo</a>
			</div>
		</div>
	</section>

	<!-- WEC 2027 Tokyo + The Commons -->
	<section class="space-y-16 bg-espresso px-4 py-28">
		<article class="mx-auto grid max-w-7xl items-center gap-10 overflow-hidden card-board p-6 sm:p-10 lg:grid-cols-2">
			<div>
				<p class="eyebrow text-cinnamon-light">Ready</p>
				<h2 class="mt-4 text-4xl font-extrabold tracking-tight sm:text-6xl">WEC 2027 Tokyo</h2>
				<p class="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sand/75">
					<span class="flex items-center gap-2"><CalendarDays class="size-5 text-cinnamon-light" /> 2 May 2027</span>
					<span class="flex items-center gap-2"><MapPin class="size-5 text-cinnamon-light" /> Tokyo, Japan</span>
				</p>
				<p class="mt-6 text-[17px] leading-relaxed text-sand/70">
					The World Espresso Championship. 32 competitors, single elimination, blind judging. One champion
					takes a career, not just a trophy. Ready to run — gated by funding, not by talent, venues, or
					permission.
				</p>
				<div class="mt-8 flex flex-wrap gap-4">
					<a href="/" class="btn rounded-lg btn-secondary px-6">Read the Statement <ArrowRight class="size-4" /></a>
					<a href="#partner" class="btn rounded-lg border-sand/20 bg-transparent px-6 text-sand btn-outline hover:bg-sand/10">
						<Shield class="size-4" /> Partner With Us
					</a>
				</div>
			</div>
			<img src="/img/home/hero2.webp" alt="WEC competitors and community celebrating" class="aspect-[16/10] w-full rounded-xl object-cover" />
		</article>

		<article
			class="relative mx-auto max-w-7xl overflow-hidden card-board bg-linear-to-br from-base-100 via-base-100 to-cinnamon/20 p-6 sm:p-12"
		>
			<span class="badge h-auto rounded-md border-0 bg-cinnamon/20 px-3 py-1.5 text-xs font-extrabold tracking-[0.25em] text-cinnamon-light">
				LAUNCHING 14 OCTOBER
			</span>
			<h2 class="mt-6 text-3xl font-extrabold tracking-tight sm:text-5xl">
				The Commons — <span class="break-all text-cinnamon-light sm:break-normal">specialtycoffeecommunity.com</span>
			</h2>
			<p class="mt-5 max-w-4xl text-[17px] leading-relaxed text-sand/75">
				A home for the people who actually make specialty coffee. Events. Jobs. Knowledge. Discussions.
				Community-driven. Free to join. 41 countries. The first 100 founding members are listed on the
				record — permanently.
			</p>
			<div class="mt-8 flex flex-wrap gap-4">
				<a href="https://specialtycoffeecommunity.com" class="btn rounded-lg btn-secondary px-6"><Bell class="size-4" /> Join The Commons</a>
				<a href="https://specialtycoffeecommunity.com" class="btn rounded-lg border-sand/20 bg-transparent px-6 text-sand btn-outline hover:bg-sand/10">
					Read More <ArrowRight class="size-4" />
				</a>
			</div>
		</article>
	</section>

	<!-- Who is WEC for -->
	<section class="px-4 py-28">
		<div class="mx-auto max-w-7xl">
			<div class="mx-auto max-w-2xl text-center">
				<h2 class="text-4xl font-extrabold tracking-tight sm:text-5xl">Who Is WEC For?</h2>
				<p class="mt-5 text-lg text-sand/65">
					Whether you want to compete, sponsor, judge, volunteer, or simply be part of the community —
					there's a place for you.
				</p>
			</div>
			<div class="mt-14 grid gap-6 md:grid-cols-3">
				{#each audiences as item (item.title)}
					<a href="/" class="group card-board flex flex-col overflow-hidden transition-transform hover:-translate-y-1">
						<div class="aspect-[16/9] overflow-hidden">
							<img src={item.image} alt="" loading="lazy" class="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
						</div>
						<div class="flex flex-1 flex-col p-8">
							<span class="flex size-14 items-center justify-center rounded-xl {item.tone}">
								<item.icon class="size-6" />
							</span>
							<h3 class="mt-6 text-2xl font-bold">{item.title}</h3>
							<p class="mt-3 text-[15px] leading-relaxed text-sand/65">{item.body}</p>
							<span class="mt-auto flex items-center gap-2 pt-6 text-sm font-semibold {item.tone.split(' ')[0]}">
								{item.cta} <ArrowRight class="size-4 transition-transform group-hover:translate-x-1" />
							</span>
						</div>
					</a>
				{/each}
			</div>
		</div>
	</section>

	<!-- Vision -->
	<section class="px-4 pb-28">
		<div class="relative isolate mx-auto max-w-7xl overflow-hidden card-board">
			<img src="/img/home/hero3.webp" alt="" class="absolute inset-0 -z-20 size-full object-cover" />
			<div class="absolute inset-0 -z-10 bg-linear-to-r from-base-100 via-base-100/95 to-base-100/40"></div>
			<div class="max-w-xl p-8 sm:p-12">
				<Eye class="size-10 text-cinnamon-light" />
				<h2 class="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">A New Vision for Coffee</h2>
				<p class="mt-6 text-[17px] leading-relaxed text-sand/70">
					<b class="text-sand">Every year someone wins the World Barista Championship. Virtually no one gets to taste their coffee.</b>
					WEC exists to change that. Our champion's espresso is replicable — same beans, same machine, same
					water — which means it can be roasted, packaged, and shared.
				</p>
				<p class="mt-5 text-[17px] leading-relaxed text-sand/70">
					Competition as innovation. Competition as transparency. Competition as commercial opportunity.
					Every barista can learn from it. Every cafe can serve it. The winner gets paid. The industry gets
					better. Good coffee was never meant to stay on stage.
				</p>
				<a href="/" class="btn mt-8 rounded-lg btn-secondary px-6">Read Our Vision <ArrowRight class="size-4" /></a>
			</div>
		</div>
	</section>

	<!-- Gallery -->
	<section class="bg-espresso px-4 py-28">
		<div class="mx-auto max-w-7xl">
			<div class="text-center">
				<h2 class="text-4xl font-extrabold tracking-tight sm:text-5xl">The WEC Experience</h2>
				<p class="mt-4 text-lg text-sand/60">Photos from past championships around the world.</p>
			</div>
			<div class="mt-14 gap-6 sm:columns-2">
				{#each gallery as photo (photo.src)}
					<img src={photo.src} alt={photo.alt} loading="lazy" class="mb-6 w-full break-inside-avoid rounded-xl object-cover" />
				{/each}
			</div>
		</div>
	</section>

	<!-- Partner CTA -->
	<section id="partner" class="relative isolate scroll-mt-24 overflow-hidden px-4 py-32 text-center">
		<img src="/img/home/crowd1.webp" alt="" class="absolute inset-0 -z-20 size-full object-cover" />
		<div class="absolute inset-0 -z-10 bg-espresso/80"></div>
		<h2 class="text-4xl font-extrabold tracking-tight sm:text-6xl">WEC 2027 Tokyo Is Ready</h2>
		<p class="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-sand/75">
			Ready to run — gated by funding, not by talent, venues, or permission. Be part of the first
			independently-run World Espresso Championship.
		</p>
		<a href="mailto:hello@worldespressochampionship.com" class="btn mt-10 btn-lg rounded-lg btn-secondary px-8">
			<MessageSquare class="size-5" /> Partner With Us
		</a>
	</section>
</main>

<SiteFooter />
