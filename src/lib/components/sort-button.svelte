<script lang="ts">
	let up = $state(true)
	$inspect(up)
	let { onclick }: { onclick?: (dir: 'asc' | 'desc') => void } = $props()
</script>

<button
	onclick={() => {
		up = !up
		if (onclick) {
			onclick(up ? 'asc' : 'desc')
		}
	}}
>
	{up ? '▲' : '▼'}
</button>

<style>
	button {
		background-color: transparent;
		padding: 0;
		border: none;
	}
	button:focus {
		border: none;
		outline: none;
	}
</style>
