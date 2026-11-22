<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import './glass.css';

	type Props = Omit<HTMLInputAttributes, 'type'>;
	let { checked = $bindable(), class: className, ...attributes }: Props = $props();
</script>

<input {...attributes} type="checkbox" bind:checked class={['glass-check', className]} />
