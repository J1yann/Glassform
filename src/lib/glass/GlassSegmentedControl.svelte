<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import GlassRadioGroup from './GlassRadioGroup.svelte';

	type Props = Omit<ComponentProps<typeof GlassRadioGroup>, 'segmented'>;
	let { value = $bindable(), ...attributes }: Props = $props();
</script>

<GlassRadioGroup {...attributes} bind:value segmented />
