<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';
	import './glass.css';

	let { value = $bindable(), class: className, ...attributes }: HTMLTextareaAttributes = $props();
</script>

<textarea {...attributes} bind:value class={['glass-field', 'glass-textarea', className]}
></textarea>
