<script lang="ts">
	import { onMount } from 'svelte';
	import { lensDisplacementMap } from '../lib/glass/lens-profile';

	let {
		blur,
		refract,
		ripple,
		circular = false,
		filterId = 'glassform-svg-lens',
		strength = 1,
		ready = $bindable(false)
	}: {
		blur: number;
		refract: boolean;
		ripple: number;
		circular?: boolean;
		filterId?: string;
		strength?: number;
		ready?: boolean;
	} = $props();
	let svg: SVGSVGElement;
	let width = $state(0);
	let height = $state(0);
	const circularMapSize = 1 / 0.9;
	const circularMapInset = (1 - circularMapSize) / 2;
	onMount(() => {
		const lens = svg.parentElement?.querySelector<HTMLElement>('[data-lens]');
		if (!lens) return;
		const observer = new ResizeObserver(() => {
			const w = lens.offsetWidth;
			const h = lens.offsetHeight;
			width = w;
			height = h;
			ready = w > 0 && h > 0;
		});
		observer.observe(lens, { box: 'border-box' });
		return () => {
			observer.disconnect();
			ready = false;
		};
	});
</script>

<svg bind:this={svg} aria-hidden="true" width="0" height="0">
	<defs>
		{#if width && height}
			<filter
				id={filterId}
				x={circular ? undefined : '0'}
				y={circular ? undefined : '0'}
				width={circular ? undefined : '100%'}
				height={circular ? undefined : '100%'}
				primitiveUnits={circular ? 'objectBoundingBox' : 'userSpaceOnUse'}
				color-interpolation-filters="sRGB"
			>
				{#if blur > 0}
					<feGaussianBlur
						in="SourceGraphic"
						stdDeviation={circular ? blur / width : blur}
						edgeMode={circular ? undefined : 'duplicate'}
						result="softened"
					/>
				{/if}
				<feImage
					href={lensDisplacementMap}
					x={circular ? circularMapInset : 0}
					y={circular ? circularMapInset : 0}
					width={circular ? circularMapSize : width}
					height={circular ? circularMapSize : height}
					preserveAspectRatio="none"
					result="refraction"
				/>
				<feDisplacementMap
					in={blur > 0 ? 'softened' : 'SourceGraphic'}
					in2="refraction"
					scale={refract ? (circular ? strength : Math.min(width, height) * strength) : 0}
					xChannelSelector="R"
					yChannelSelector="G"
					result="bent"
				/>
				{#if refract && ripple > 0}
					<feTurbulence
						type="fractalNoise"
						baseFrequency={circular ? `${0.021 * width} ${0.028 * height}` : '0.021 0.028'}
						numOctaves="2"
						seed="7"
						result="noise"
					/>
					<feGaussianBlur
						in="noise"
						stdDeviation={circular ? 2.5 / width : 2.5}
						edgeMode="duplicate"
						result="soft-noise"
					/>
					<feDisplacementMap
						in="bent"
						in2="soft-noise"
						scale={circular ? ripple / width : ripple}
						xChannelSelector="R"
						yChannelSelector="G"
						result="rippled"
					/>
					<feFlood
						x={circular ? 14 / width : 14}
						y={circular ? 14 / height : 14}
						width={Math.max(0, circular ? 1 - 28 / width : width - 28)}
						height={Math.max(0, circular ? 1 - 28 / height : height - 28)}
						result="inset"
					/>
					<feGaussianBlur in="inset" stdDeviation={circular ? 3 / width : 3} result="interior" />
					<feComposite in="rippled" in2="interior" operator="in" result="interior-ripple" />
					<feComposite in="interior-ripple" in2="bent" operator="over" result="liquid" />
				{/if}
			</filter>
		{/if}
	</defs>
</svg>

<style>
	svg {
		position: absolute;
		pointer-events: none;
	}
</style>
