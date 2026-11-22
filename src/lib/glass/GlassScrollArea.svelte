<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import './glass.css';

	type Props = Omit<HTMLAttributes<HTMLDivElement>, 'role' | 'tabindex' | 'aria-label'> & {
		label: string;
	};
	let { label, children, class: className, ...attributes }: Props = $props();
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard users need to focus the native scroll region.) -->
<div
	{...attributes}
	role="region"
	aria-label={label}
	tabindex="0"
	class={['glass-scroll-area', className]}
>
	{@render children?.()}
</div>
