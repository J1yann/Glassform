<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getSolidPreference, type GlassMaterial } from './material';
	import './glass.css';

	type Props = HTMLAttributes<HTMLDivElement> & {
		children?: Snippet;
		material?: GlassMaterial;
	};

	let { children, material = 'lens', class: className, ...attributes }: Props = $props();

	const isSolid = getSolidPreference();
	const resolvedMaterial = $derived(isSolid?.() ? 'solid' : material);
</script>

<div {...attributes} class={['glass-surface', className]} data-material={resolvedMaterial}>
	{@render children?.()}
</div>
