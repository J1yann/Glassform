<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import './glass.css';

	type Props = Omit<HTMLInputAttributes, 'type' | 'role'>;
	let { checked = $bindable(), class: className, ...attributes }: Props = $props();
	const nativeSwitch = { switch: true } as Record<string, boolean>;
</script>

<input
	{...attributes}
	{...nativeSwitch}
	type="checkbox"
	role="switch"
	bind:checked
	class={['glass-check', 'glass-switch', className]}
/>
