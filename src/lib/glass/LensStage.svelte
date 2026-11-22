<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import type { HTMLAttributes, HTMLImgAttributes } from 'svelte/elements';
	import BackdropLens from './BackdropLens.svelte';
	import { photoOverscan } from './backdrop-lens';
	import { defaultLensBlur, lensDisplacementMap } from './lens-profile';

	type Photo = Pick<
		HTMLImgAttributes,
		'srcset' | 'sizes' | 'width' | 'height' | 'alt' | 'loading' | 'fetchpriority' | 'crossorigin'
	> & { src: string };

	type Props = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
		photo: Photo;
		blur?: number;
		ripple?: number;
		refract?: boolean;
		trackPointer?: boolean;
		photoX?: number;
		photoY?: number;
		children?: Snippet;
	};

	let {
		photo,
		blur = defaultLensBlur,
		ripple = 0,
		refract = true,
		trackPointer = false,
		photoX = 50,
		photoY = 50,
		class: className,
		children,
		...attributes
	}: Props = $props();

	let ready = $state(false);
	let useSvg = $state(false);
	const id = $props.id();
	const filterId = `${id}-lens-stage`;

	onMount(() => {
		useSvg =
			/Chrom(e|ium)\//.test(navigator.userAgent) &&
			CSS.supports('backdrop-filter', `url(#${filterId})`);
	});
</script>

<div
	{...attributes}
	class={['lens-stage', className]}
	class:rendered={ready}
	class:svg-fallback={useSvg && !ready && refract}
	data-glass-lens-stage=""
	style:--lens-stage-blur={`${Math.max(0, blur)}px`}
	style:--lens-stage-svg={`url(#${filterId})`}
	style:--lens-stage-photo-size={`${photoOverscan * 100}%`}
>
	<img
		{...photo}
		class="leaf-photo"
		alt={photo.alt ?? ''}
		style:left={`${(1 - photoOverscan) * photoX}%`}
		style:top={`${(1 - photoOverscan) * photoY}%`}
		style:object-position={`${photoX}% ${photoY}%`}
	/>
	{#if refract}
		{#key `${photo.src}:${photo.crossorigin}:${trackPointer}`}
			<BackdropLens
				appearance="system"
				paused
				optical
				autoDiscover
				{trackPointer}
				{blur}
				{ripple}
				{refract}
				{photoX}
				{photoY}
				bind:ready
			/>
		{/key}
	{/if}
	{#if useSvg && !ready && refract}
		<svg class="filter" aria-hidden="true" width="0" height="0">
			<filter id={filterId} primitiveUnits="objectBoundingBox" color-interpolation-filters="sRGB">
				<feImage
					href={lensDisplacementMap}
					x="-0.0556"
					y="-0.0556"
					width="1.1112"
					height="1.1112"
					preserveAspectRatio="none"
					result="map"
				/>
				<feDisplacementMap
					in="SourceGraphic"
					in2="map"
					scale="1"
					xChannelSelector="R"
					yChannelSelector="G"
					result="bent"
				/>
				{#if ripple > 0}
					<feTurbulence
						type="fractalNoise"
						baseFrequency="4 3"
						numOctaves="2"
						result="ripple-map"
					/>
					<feDisplacementMap
						in="bent"
						in2="ripple-map"
						scale={ripple / 240}
						xChannelSelector="R"
						yChannelSelector="G"
					/>
				{/if}
			</filter>
		</svg>
	{/if}
	<div class="foreground">
		{@render children?.()}
	</div>
</div>

<style>
	.lens-stage {
		position: relative;
		display: grid;
		overflow: clip;
		isolation: isolate;
		--lens-stage-filter: blur(var(--lens-stage-blur));
		--lens-stage-drawn-filter: var(--lens-stage-filter);
		--glass-blur: var(--lens-stage-blur);
	}
	.svg-fallback {
		--lens-stage-filter: blur(var(--lens-stage-blur)) var(--lens-stage-svg);
	}
	.rendered {
		--lens-stage-drawn-filter: none;
	}
	.leaf-photo {
		position: absolute;
		display: block;
		inline-size: var(--lens-stage-photo-size);
		block-size: var(--lens-stage-photo-size);
		object-fit: cover;
		pointer-events: none;
	}
	.rendered > .leaf-photo {
		visibility: hidden;
	}
	.foreground {
		position: relative;
		min-inline-size: 0;
	}
	.filter {
		position: absolute;
		pointer-events: none;
	}
	@media (forced-colors: none) and (not (prefers-reduced-transparency: reduce)) {
		.lens-stage :global([data-material='lens']) {
			backdrop-filter: var(--lens-stage-filter);
			box-shadow: 0 0 0 var(--glass-rim-width, 2px) var(--glass-rim, #ffffff99);
		}
		.lens-stage :global([data-material='lens'][data-lens-stage-rendered]) {
			backdrop-filter: var(--lens-stage-drawn-filter);
		}
	}
</style>
