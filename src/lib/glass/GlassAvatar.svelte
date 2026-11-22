<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import './glass.css';

	type Props = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
		src?: string;
		alt: string;
		fallback?: string;
	};
	let { src, alt, fallback, class: className, ...attributes }: Props = $props();
	let failed = $state<string>();
</script>

<span
	{...attributes}
	class={['glass-avatar', className]}
	role={alt ? 'img' : undefined}
	aria-label={alt || undefined}
	aria-hidden={alt ? undefined : true}
>
	{#if src && src !== failed}
		{#key src}
			<img {src} alt="" onload={() => (failed = undefined)} onerror={() => (failed = src)} />
		{/key}
	{:else}
		<span aria-hidden="true">
			{fallback ??
				alt
					.trim()
					.split(/\s+/)
					.slice(0, 2)
					.map((word) => word[0])
					.join('')}
		</span>
	{/if}
</span>
