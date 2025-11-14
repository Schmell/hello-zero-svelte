import { ZERO_UPSTREAM_DB } from '$env/static/private'
import { createServerMutators } from '$lib/server/server-mutators'
import { createMutators } from '$lib/zero/mutators.svelte'
import { schema } from '$lib/zero/schema'
import { PostgresJSConnection, PushProcessor, ZQLDatabase } from '@rocicorp/zero/pg'
import { json, type RequestHandler } from '@sveltejs/kit'
import postgres from 'postgres'

export const POST: RequestHandler = async ({ request, cookies, locals }) => {
	// console.log('auth_cookie: ', cookies.get('auth'), 'push-processor')
	// console.log('locals: ', locals.user, 'push-processor')

	const asyncTasks: Array<() => Promise<void>> = []

	const processor = new PushProcessor(
		new ZQLDatabase(new PostgresJSConnection(postgres(ZERO_UPSTREAM_DB)), schema)
	)

	const result = await processor.process(
		createServerMutators(createMutators(locals.user.id), asyncTasks),
		request
	)

	await Promise.all(asyncTasks.map((task) => task()))

	return json(result)
}
