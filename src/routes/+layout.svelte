<script lang="ts">
	import favicon from '#lib/assets/glassform-mark.png';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" type="image/png" href={favicon} />
</svelte:head>

{@render children()}
