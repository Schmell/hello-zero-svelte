export const ssr = false

import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		userID: locals.user ? locals.user.id : 'anon',
	}
}
