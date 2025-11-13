<script lang="ts">
	import type { Snippet } from 'svelte'
	import SortButton from './sort-button.svelte'

	let {
		children,
		onclick,
		nobutton = false,
	}: { children: Snippet; onclick?: (dir: 'asc' | 'desc') => void; nobutton?: boolean } = $props()
</script>

<th>
	<div>
		{@render children()}
		{#if !nobutton}
			<SortButton {onclick}></SortButton>
		{/if}
	</div>
</th>

<style>
	th > div {
		display: flex;
		gap: 1rem;
		align-items: center;
	}
</style>
