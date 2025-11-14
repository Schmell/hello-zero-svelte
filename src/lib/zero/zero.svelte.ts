import { PUBLIC_SERVER } from '$env/static/public'
import { createMutators, type ClientMutators } from './mutators.svelte'
import { schema, type Schema } from './schema'
import { Z } from 'zero-svelte'

export function useZero(userID: string) {
	return new Z<Schema, ClientMutators>({
		server: PUBLIC_SERVER,
		schema,
		userID,
		mutators: createMutators(userID),
		kvStore: 'idb',
	})
}
