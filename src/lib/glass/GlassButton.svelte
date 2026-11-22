<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getSolidPreference, type GlassMaterial } from './material';
	import './glass.css';

	type ButtonMaterial = GlassMaterial | 'embedded';
	type Props = HTMLButtonAttributes & {
		material?: ButtonMaterial;
	};

	let {
		children,
		class: className,
		type = 'button',
		material = 'solid',
		...attributes
	}: Props = $props();

	const isSolid = getSolidPreference();
	const resolvedMaterial = $derived(isSolid?.() ? 'solid' : material);
</script>

<button
	{...attributes}
	{type}
	class={['glass-surface', 'glass-button', className]}
	data-material={resolvedMaterial}
>
	<span class="glass-button-label">{@render children?.()}</span>
</button>
