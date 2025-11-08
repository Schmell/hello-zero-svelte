import { PUBLIC_SERVER } from '$env/static/public'
import { createMutators, type Mutators } from './mutators'
import { schema, type Schema } from './schema'
import { Z } from 'zero-svelte'

export function useZero(userID: string) {
	return new Z<Schema, Mutators>({
		server: PUBLIC_SERVER,
		schema,
		userID,
		mutators: createMutators(userID),
	})
}
