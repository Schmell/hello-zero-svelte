import { sequence } from '@sveltejs/kit/hooks'
import type { Handle } from '@sveltejs/kit'

const authHook: Handle = async ({ event, resolve }) => {
	const auth_cookie = event.cookies.get('auth') ?? 'anon'

	event.locals.user = { id: auth_cookie }

	return await resolve(event)
}

export const handle = sequence(authHook /*, other hooks */)
