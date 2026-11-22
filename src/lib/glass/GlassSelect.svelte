<script lang="ts">
	import type { HTMLSelectAttributes } from 'svelte/elements';
	import type { GlassOption } from './options';
	import './glass.css';

	type Props = Omit<HTMLSelectAttributes, 'multiple' | 'children' | 'value'> & {
		options: readonly GlassOption[];
		value?: string;
	};

	let { options, value = $bindable(), class: className, ...attributes }: Props = $props();
</script>

<select {...attributes} bind:value class={['glass-field', className]}>
	{#each options as option (option.value)}
		<option value={option.value} disabled={option.disabled}>{option.label}</option>
	{/each}
</select>
