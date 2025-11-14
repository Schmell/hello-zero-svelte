# Hello Zero

## Option 1: Run this repo

First, install dependencies:

```sh
npm i
```

Next, run docker:

```sh
npm run dev:db-up
```

**In a second terminal**, run the zero cache server:

```sh
npm run dev:zero-cache
```

**In a third terminal**, run the Vite dev server:

```sh
npm run dev:ui
```

## Option 2: Install Zero in your own project

This guide explains how to set up Zero in your React application, using this
repository as a reference implementation.

### Prerequisites

**1. PostgreSQL database with Write-Ahead Logging (WAL) enabled**

See [Connecting to Postgres](https://zero.rocicorp.dev/docs/connecting-to-postgres)

**2. Environment Variables**

Set the following environment variables. `ZSTART_UPSTREAM_DB` is the URL to your Postgres
database.

```ini
# Your application's data
ZERO_UPSTREAM_DB="postgresql://user:password@127.0.0.1/mydb"

# Secret to decode auth token.
ZERO_AUTH_SECRET="secretkey"

# Place to store sqlite replica file.
ZERO_REPLICA_FILE="/tmp/zstart_replica.db"

# Where UI will connect to zero-cache.
VITE_PUBLIC_SERVER=http://localhost:4848
```

### Setup

1. **Install Zero**

```bash
npm install @rocicorp/zero
```

2. **Create Schema** Define your database schema using Zero's schema builder.
   See [schema.ts](src/lib//zero/schema.ts) for example:

```typescript
import { createSchema, table, string } from '@rocicorp/zero'

const user = table('user')
	.columns({
		id: string(),
		name: string(),
	})
	.primaryKey('id')

export const schema = createSchema({
	tables: [user],
})

export type Schema = typeof schema
```

3. **Initialize Zero Client-Side** Set up the Zero provider
   point. See [zero.svelte.ts](src/lib/zero/zero.svelte.ts):

```ts
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
	})
}
```

4. **Using Zero in Components** Example usage in Svelte components. See
   [+page.svelte](src/routes/+page.svelte):
   First of all. In sveltekit you need to turn off server-side rendering when using zero on the page

```ts
// src/routes/+layout.server.ts
export const ssr = false
```

```svelte
<!-- src/routes/+page.svelte -->
<script lang="ts">
	import { queries } from '$lib/zero/queries.svelte'
	import { useZero } from '$lib/zero/zero.svelte'
	import type { PageProps } from './$types'

	let { data }: PageProps = $props()

	const zero = useZero(data.userID)
	// this is using custom/syncedQueries
	const users = zero.createQuery(queries.allUsers())
	// using q alias and regular query
	const mediums = zero.q(zero.query.medium)
</script>

<ul>
	{#each users.data as user}
		<li>{user.name}</li>
	{/each}
</ul>

<ul>
	{#each mediums.data as medium}
		<li>{medium.name}</li>
	{/each}
</ul>
```

For more examples of queries, mutations, and relationships, explore these files in the repository
[queries.svelte.ts](src/lib/zero/queries.svelte.ts)
[mutators.svelte.ts](src/lib/zero/mutators.svelte.ts)

### Optional: Authentication

This example includes Cookie-based authentication. See [api/hooks.server.ts](src/hooks.server.ts)

### Development

**1. Start the PostgreSQL database:**

If you are using Docker (referencing the example in
[docker](docker/docker-compose.yml)), run:

```bash
npm run dev:db-up
```

**2. Start the zero cache server (in a separate terminal):**

```bash
npx zero-cache
```

**3. Start your React dev server**

```bash
npm run dev # this depends on your react app setup
```
