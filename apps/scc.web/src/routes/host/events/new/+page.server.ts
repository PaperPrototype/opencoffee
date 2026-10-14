import { fail, redirect } from '@sveltejs/kit';
import { slugify, slugSuffix } from '#lib/events.js';
import { parseEventForm, uploadCover } from '#lib/server/event-form.js';
import { requireHost } from '#lib/server/events.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase, user } }) => {
	await requireHost(supabase, user!.id);
};

export const actions: Actions = {
	default: async ({ request, locals: { supabase, user } }) => {
		const host = await requireHost(supabase, user!.id);
		const form = await request.formData();

		const parsed = parseEventForm(form);
		if (parsed.error) return fail(400, { message: parsed.error });
		const cover = await uploadCover(supabase, user!.id, form);
		if (cover.error) return fail(400, { message: cover.error });

		const { data: event, error } = await supabase
			.from('events')
			.insert({
				...parsed.values!,
				host_id: host.id,
				slug: `${slugify(parsed.values!.title) || 'event'}-${slugSuffix()}`,
				cover_image_url: cover.url
			})
			.select('id')
			.single();
		if (error) return fail(400, { message: error.message });

		if (parsed.secret!.online_url || parsed.secret!.attendee_info) {
			await supabase.from('event_private').insert({ event_id: event.id, ...parsed.secret! });
		}

		// Start with one free ticket so the event is ready to publish; the host edits it from here.
		await supabase.from('ticket_types').insert({ event_id: event.id, name: 'General admission', price: 0 });

		redirect(303, `/host/events/${event.id}?created=1`);
	}
};
