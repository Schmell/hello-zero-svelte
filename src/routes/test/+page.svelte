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
