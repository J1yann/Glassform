<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import './glass.css';

	let { children, class: className, ...attributes }: HTMLAttributes<HTMLElement> = $props();
</script>

<kbd {...attributes} class={['glass-kbd', className]}>{@render children?.()}</kbd>
