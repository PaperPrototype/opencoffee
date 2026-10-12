<script lang="ts">
	import { contacts, menus } from '#lib/site.js';
</script>

<footer class="border-t border-sand/10 bg-espresso">
	<div class="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-8 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
		<div class="max-w-sm">
			<a href="/" class="flex items-center gap-3">
				<img src="/img/brandmark-white.png" alt="" class="h-12 w-auto" />
				<span class="leading-tight">
					<span class="block text-base font-bold tracking-[0.15em]">WORLD ESPRESSO</span>
					<span class="block text-xs tracking-[0.3em] text-cinnamon-light">CHAMPIONSHIP</span>
				</span>
			</a>
			<p class="mt-5 text-[15px] leading-relaxed text-sand/75">
				The world's most objective espresso competition. Same coffee. Same machine. Only the barista
				differs.
			</p>
			<p class="mt-4 text-sm text-sand/50">WEC 2027 World Final — Tokyo, 2 May 2027</p>
			<a href="mailto:{contacts.general}" class="text-sm text-sand/50 hover:text-sand">{contacts.general}</a>

			<div class="mt-6 rounded-xl bg-black/25 p-4">
				<p class="text-[10px] font-extrabold tracking-[0.25em] text-cinnamon-light">CONTACT — THE ONLY TWO</p>
				<a href="mailto:{contacts.email}" class="mt-2 block text-sm hover:text-accent">{contacts.email}</a>
				<p class="mt-1 text-sm">{contacts.whatsapp} (WhatsApp)</p>
			</div>
		</div>

		{#each menus as menu (menu.label)}
			<div>
				<h4 class="text-xs font-extrabold tracking-[0.25em] text-cinnamon-light uppercase">{menu.label}</h4>
				<ul class="mt-5 space-y-3">
					{#each menu.links as link (link)}
						<li><a href="/" class="text-sm text-sand/60 transition-colors hover:text-sand">{link}</a></li>
					{/each}
				</ul>
			</div>
		{/each}
	</div>

	<div class="mx-auto flex max-w-7xl flex-col gap-3 border-t border-sand/10 px-4 py-8 text-sm text-sand/50 sm:flex-row sm:items-center sm:justify-between sm:px-8">
		<p>© 2026 World Espresso Championship. All rights reserved.</p>
		<div class="flex gap-6">
			<a href="/" class="hover:text-sand">Privacy Policy</a>
			<a href="/" class="hover:text-sand">Terms of Service</a>
		</div>
	</div>
</footer>
