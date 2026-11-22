<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import './glass.css';

	type InputType =
		| 'text'
		| 'search'
		| 'email'
		| 'password'
		| 'tel'
		| 'url'
		| 'number'
		| 'date'
		| 'time'
		| 'datetime-local'
		| 'month'
		| 'week';
	type Props = Omit<HTMLInputAttributes, 'type' | 'value'> & {
		type?: InputType;
		value?: string | number;
	};

	let { type = 'text', value = $bindable(), class: className, ...attributes }: Props = $props();
</script>

<input {...attributes} {type} bind:value class={['glass-field', className]} />
