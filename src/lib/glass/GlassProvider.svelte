<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getSolidPreference, provideSolidPreference, type GlassAppearance } from './material';
	import './glass.css';

	type Props = HTMLAttributes<HTMLElement> & {
		as?: 'div' | 'main' | 'section';
		appearance?: GlassAppearance;
		blur?: number;
		solid?: boolean;
	};

	let {
		as = 'div',
		appearance,
		blur,
		solid,
		children,
		class: className,
		...attributes
	}: Props = $props();

	const parentSolid = getSolidPreference();
	const solidMode = $derived(solid ?? parentSolid?.() ?? false);
	provideSolidPreference(() => solidMode);
</script>

<svelte:element
	this={as}
	{...attributes}
	class={['glass-provider', className]}
	data-glass-appearance={appearance}
	data-glass-solid={String(solidMode)}
	style:--glass-blur={blur !== undefined && Number.isFinite(blur)
		? `${Math.max(0, blur)}px`
		: undefined}
>
	{@render children?.()}
</svelte:element>
