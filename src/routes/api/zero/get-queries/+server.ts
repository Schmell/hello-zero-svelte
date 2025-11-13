import { queries } from '$lib/zero/queries.svelte'
import { schema } from '$lib/zero/schema'
import { withValidation, type ReadonlyJSONValue } from '@rocicorp/zero'
import { handleGetQueriesRequest } from '@rocicorp/zero/server'
import type { RequestEvent } from '@sveltejs/kit'

export async function POST({ request, cookies }: RequestEvent) {
	const auth_data = cookies.get('auth')
	const q = await handleGetQueries(request, auth_data)

	return new Response(JSON.stringify(q))
}

async function handleGetQueries(request: Request, auth_data: string = 'anon') {
	return await handleGetQueriesRequest(
		(name, args) => getQuery(auth_data, name, args),
		schema,
		request
	)
}

// Build a map of queries with validation by name.
const validated = Object.fromEntries(
	Object.values(queries).map((q) => [q.queryName, withValidation(q)])
)

function getQuery(auth_data: string, name: string, args: readonly ReadonlyJSONValue[]) {
	const q = validated[name]
	if (!q) throw new Error(`No such query: ${name}`)

	return {
		// First param is the context for contextful queries.
		// `args` are validated using the `parser` you provided with
		// the query definition.
		query: q(auth_data, ...args),
	}
}
