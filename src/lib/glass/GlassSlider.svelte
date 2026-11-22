<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import './glass.css';

	type Props = Omit<HTMLInputAttributes, 'type' | 'value'> & { value?: number };
	let { value = $bindable(), class: className, ...attributes }: Props = $props();
</script>

<input {...attributes} type="range" bind:value class={['glass-slider', className]} />
