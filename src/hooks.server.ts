import { sequence } from '@sveltejs/kit/hooks'
import type { Handle } from '@sveltejs/kit'

const authHook: Handle = async ({ event, resolve }) => {
	const auth_cookie = event.cookies.get('auth') ?? 'anon'
	// console.log(auth_cookie)
	// if (event.locals.user && event.locals.user.id && event.locals.user.id === 'anon' && auth_cookie) {
	event.locals.user = { id: auth_cookie }
	// } else {
	// event.locals.user.id = auth_cookie ?? 'anon'
	// }
	// console.log(event.locals.user)
	// event.locals.user.id = 'anon'

	return await resolve(event)
}

export const handle = sequence(authHook /*, other hooks */)
