<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../index.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>
<div>
	{@render children()}
</div>
