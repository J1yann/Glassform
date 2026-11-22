<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import GlassSurface from './GlassSurface.svelte';

	let { class: className, ...props }: ComponentProps<typeof GlassSurface> = $props();
</script>

<GlassSurface {...props} class={['glass-panel', className]} />
