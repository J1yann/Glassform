<script lang="ts">
	import type { HTMLFieldsetAttributes } from 'svelte/elements';
	import type { GlassOption } from './options';
	import './glass.css';

	type Props = Omit<HTMLFieldsetAttributes, 'children'> & {
		label: string;
		options: readonly GlassOption[];
		value?: string;
		required?: boolean;
		segmented?: boolean;
	};

	const id = $props.id();
	let {
		label,
		options,
		value = $bindable(),
		name = id,
		form,
		required,
		segmented = false,
		class: className,
		...attributes
	}: Props = $props();
</script>

<fieldset {...attributes} {form} class={['glass-radio-group', className]}>
	<legend>{label}</legend>
	<div class="glass-options" class:glass-segments={segmented}>
		{#each options as option, index (option.value)}
			<div class="glass-option">
				<input
					id={`${id}-${index}`}
					type="radio"
					{name}
					{form}
					{required}
					value={option.value}
					bind:group={value}
					disabled={option.disabled}
				/>
				<label for={`${id}-${index}`}>{option.label}</label>
			</div>
		{/each}
	</div>
</fieldset>
