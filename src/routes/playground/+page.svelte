<script lang="ts">
	import { resolve } from '$app/paths';
	import logo from '#lib/assets/glassform-mark.png';
	import { GlassButton, GlassPanel, GlassProvider, GlassSurface } from '#lib';
	import BackdropLens from '#lib/glass/BackdropLens.svelte';
	import SvgLens from '../SvgLens.svelte';
	import BottomBarDemo from './BottomBarDemo.svelte';
	import { defaultLensBlur, lensDisplacementMap } from '../../lib/glass/lens-profile';
	import { photoOverscan, type LensBackdrop } from '../../lib/glass/backdrop-lens';
	import { onMount } from 'svelte';
	import { Tween, prefersReducedMotion } from 'svelte/motion';

	const stressButtons = Array.from({ length: 24 }, (_, index) => index + 1);
	const stressRows = Array.from({ length: 30 }, (_, index) => index + 1);

	const backdrops = [
		{ value: 'prism', label: 'Prism' },
		{ value: 'grid', label: 'Grid' },
		{ value: 'rain', label: 'Rain' },
		{ value: 'meadow', label: 'Meadow' },
		{ value: 'hibiscus', label: 'Hibiscus' },
		{ value: 'photo', label: 'Leaf photo' },
		{ value: 'flat', label: 'Flat' }
	] as const;

	const photoBackdrops = {
		meadow: { file: 'meadow', width: 1232, height: 928, responsive: false },
		photo: { file: 'leaf-after-rain', width: 720, height: 960, responsive: true },
		hibiscus: { file: 'hibiscus', width: 720, height: 480, responsive: true }
	} as const;

	let backdrop = $state<(typeof backdrops)[number]['value']>('rain');
	let photo = $derived(
		backdrop in photoBackdrops ? photoBackdrops[backdrop as keyof typeof photoBackdrops] : undefined
	);
	let backdropLabel = $derived(backdrops.find((option) => option.value === backdrop)?.label);
	let appearance = $state<'system' | 'light' | 'dark'>('system');
	let preset = $state('panel');
	let blur = $state(defaultLensBlur);
	let solid = $state(false);
	let selected = $state<number | null>(null);
	let showLens = $derived(!solid);
	let shaderBackdrop: LensBackdrop = $derived(photo ? 'rain' : backdrop as LensBackdrop);
	let shaderReady = $state(false);
	let shaderUnavailable = $state(false);
	let shaderActive = $derived(showLens && shaderReady && !shaderUnavailable);
	const materials = ['lens', 'solid'] as const;
	let rainPaused = $state(false);
	let lensReady = $state(false);
	let refract = $state(true);
	let ripple = $state(0);
	let lensHovered = $state(false);
	const strength = new Tween(1, { duration: 300 });
	let photoX = $state(50);
	let photoY = $state(50);
	let photoDrag = $state<{
		pointer: number;
		x: number;
		y: number;
		startX: number;
		startY: number;
		overflowX: number;
		overflowY: number;
	}>();

	function startPhotoDrag(event: PointerEvent & { currentTarget: HTMLElement }) {
		if (!event.isPrimary || event.button !== 0) return;
		const target = event.currentTarget;
		const image = target.parentElement?.querySelector<HTMLImageElement>('.leaf-photo');
		if (!image?.naturalWidth) return;

		const width = target.clientWidth;
		const height = target.clientHeight;
		const cover = Math.max(width / image.naturalWidth, height / image.naturalHeight) * photoOverscan;
		photoDrag = {
			pointer: event.pointerId,
			x: event.clientX,
			y: event.clientY,
			startX: photoX,
			startY: photoY,
			overflowX: Math.max(1, image.naturalWidth * cover - width),
			overflowY: Math.max(1, image.naturalHeight * cover - height)
		};
		target.setPointerCapture(event.pointerId);
	}

	function clampPhotoPosition(value: number) {
		return Math.min(100, Math.max(0, value));
	}

	function movePhoto(event: PointerEvent) {
		if (photoDrag?.pointer !== event.pointerId) return;
		photoX = clampPhotoPosition(photoDrag.startX - 100 * (event.clientX - photoDrag.x) / photoDrag.overflowX);
		photoY = clampPhotoPosition(photoDrag.startY - 100 * (event.clientY - photoDrag.y) / photoDrag.overflowY);
	}

	function stopPhotoDrag(event: PointerEvent) {
		if (photoDrag?.pointer === event.pointerId) photoDrag = undefined;
	}

	function movePhotoWithKeys(event: KeyboardEvent) {
		const offsets = { ArrowLeft: [5, 0], ArrowRight: [-5, 0], ArrowUp: [0, 5], ArrowDown: [0, -5] } as const;
		if (!(event.key in offsets)) return;
		const [x, y] = offsets[event.key as keyof typeof offsets];
		event.preventDefault();
		photoX = clampPhotoPosition(photoX + x);
		photoY = clampPhotoPosition(photoY + y);
	}

	let useSvgLens = $state(false);
	let componentLensReady = $derived(showLens && !shaderActive && preset !== 'materials' && useSvgLens);
	let opticsReady = $derived(showLens && (shaderActive || componentLensReady || lensReady));
	const id = $props.id();
	const componentFilter = `${id}-component-lens`;

	$effect(() => {
		const reduced = prefersReducedMotion.current;
		const deepen = showLens && preset === 'materials' && refract && lensHovered && !reduced;
		void strength.set(deepen ? 1.4 : 1, {
			duration: reduced ? 0 : 300
		});
	});

	onMount(() => {
		// Some engines parse this declaration but do not render SVG backdrop filters.
		useSvgLens =
			/Chrom(e|ium)\//.test(navigator.userAgent) &&
			CSS.supports('backdrop-filter', 'url(#glassform-svg-lens)');
	});
	const drops = Array.from({ length: 24 }, (_, index) => ({
		x: (index * 71 + 13) % 280,
		y: (index * 47 + 7) % 117,
		length: 25 + ((index * 11) % 22)
	}));
</script>

<svelte:head>
	<title>Glassform · Playground</title>
	<meta name="description" content="Tune Lens blur and refraction across different backdrops." />
</svelte:head>

<GlassProvider as="main" class="playground" {appearance} {solid} {blur}>
	<header class="header">
		<a class="brand" href={resolve('/')} aria-label="Glassform home">
			<img src={logo} alt="" width="48" height="48" />
		</a>
		<nav aria-label="Resources">
			<a href={resolve('/docs')}>Documentation</a>
		</nav>
	</header>

	<section class="intro">
		<h1>Material playground</h1>
		<p>Explore how glass responds to different backdrops and component shapes.</p>
	</section>

	<div class="workspace">
		<section class="specimen" id="preview" aria-label="Material preview">
			<div class="preview-toolbar">
				<h2>Preview</h2>
				<label class="preset-picker">
					Preset
					<select
						bind:value={preset}
						onchange={() => {
							selected = null;
						}}
					>
						<option value="materials">Material comparison</option>
						<option value="panel">Panel and bottom bar</option>
						<option value="buttons">Multiple buttons</option>
						<option value="list">Scrolling list</option>
					</select>
				</label>
			</div>
			<div
				class="stage"
				data-backdrop={backdrop}
				class:component-preset={preset !== 'materials'}
				class:has-lens={shaderActive}
				class:has-svg-lens={showLens && !shaderActive && lensReady && useSvgLens}
				class:has-component-lens={componentLensReady}
				style:--component-lens-filter={`url(#${componentFilter})`}
			>
				<div class="art" aria-hidden="true">
					{#if backdrop === 'rain'}
						<svg class="rain" class:paused={rainPaused} aria-hidden="true">
							<defs>
								<pattern id="glassform-rain" width="280" height="144" patternUnits="userSpaceOnUse">
									{#each drops as { x, y, length } (x)}
										<path d={`M${x} ${y}v${length}`} />
									{/each}
								</pattern>
							</defs>
							<rect class="rain-far" width="100%" height="100%" fill="url(#glassform-rain)" />
							<rect class="rain-near" width="100%" height="100%" fill="url(#glassform-rain)" />
						</svg>
					{:else if photo}
						<img
							class="leaf-photo"
							style:--photo-size={`${photoOverscan * 100}%`}
							style:--photo-left={`${(1 - photoOverscan) * photoX}%`}
							style:--photo-top={`${(1 - photoOverscan) * photoY}%`}
							style:object-position={`${photoX}% ${photoY}%`}
							src={`/images/${photo.file}${photo.responsive ? '-720' : ''}.webp`}
							srcset={photo.responsive
								? `/images/${photo.file}-720.webp 720w, /images/${photo.file}-1440.webp 1440w`
								: undefined}
							sizes={`(max-width: 800px) ${photoOverscan * 100}vw, ${photoOverscan * 1060}px`}
							fetchpriority={backdrop === 'hibiscus' ? 'high' : undefined}
							width={photo.width}
							height={photo.height}
							alt=""
						/>
					{:else}
						<i></i><i></i><i></i>
					{/if}
				</div>
				{#if photo}
					<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions (The preview supports arrow-key panning.) -->
					<div
						class="photo-drag"
						class:dragging={!!photoDrag}
						role="group"
						aria-label="Reposition photo with the arrow keys"
						tabindex="0"
						onpointerdown={startPhotoDrag}
						onpointermove={movePhoto}
						onpointerup={stopPhotoDrag}
						onpointercancel={stopPhotoDrag}
						onlostpointercapture={stopPhotoDrag}
						onkeydown={movePhotoWithKeys}
					></div>
				{/if}
				{#if componentLensReady}
					<svg class="component-filter" width="0" height="0" aria-hidden="true">
						<filter id={componentFilter} primitiveUnits="objectBoundingBox" color-interpolation-filters="sRGB">
							<feImage href={lensDisplacementMap} width="1" height="1" preserveAspectRatio="none" result="map" />
							<feDisplacementMap
								in="SourceGraphic"
								in2="map"
								scale={refract ? 1 : 0}
								result="bent"
								xChannelSelector="R"
								yChannelSelector="G"
							/>
							{#if refract && ripple > 0}
								<feTurbulence type="fractalNoise" baseFrequency="4 3" numOctaves="2" result="ripple-map" />
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
				{#if showLens}
					{#key `${backdrop}:${preset}`}
						{#if !shaderUnavailable}
							<BackdropLens
								backdrop={shaderBackdrop}
								optical
								trackPointer
								circular={preset === 'materials'}
								{photoX}
								{photoY}
								{refract}
								{ripple}
								{appearance}
								strength={preset === 'materials' ? strength.current : 1}
								paused={rainPaused}
								{blur}
								onUnavailable={() => (shaderUnavailable = true)}
								bind:ready={shaderReady}
							/>
						{/if}
						{#if !shaderActive && useSvgLens && preset === 'materials'}
							<SvgLens {refract} {ripple} strength={strength.current} circular {blur} bind:ready={lensReady} />
						{/if}
					{/key}
				{/if}
				{#if preset === 'panel'}
					<BottomBarDemo material="lens">
						<h2>Large panel</h2>
						<p>One Lens surface with selectable text and embedded controls.</p>
						<div class="panel-actions">
							<GlassButton
								material="embedded"
								aria-pressed={selected === 0}
								onclick={() => (selected = selected === 0 ? null : 0)}
							>
								Preview
							</GlassButton>
							<GlassButton material="embedded" disabled>Unavailable</GlassButton>
						</div>
					</BottomBarDemo>
				{:else if preset === 'buttons'}
					<div class="button-grid">
						{#each stressButtons as number (number)}
							<GlassButton
								material="lens"
								data-component-lens
								aria-pressed={selected === number}
								onclick={() => (selected = selected === number ? null : number)}
							>
								{number}
							</GlassButton>
						{/each}
					</div>
				{:else if preset === 'list'}
					<GlassPanel data-component-lens>
						<h2 id="sample-list">Scrolling list</h2>
						<!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard access to the native scroll area) -->
						<div class="scroll-sample" role="region" aria-labelledby="sample-list" tabindex="0">
							<ol>
								{#each stressRows as row (row)}
									<li>Sample row {row}</li>
								{/each}
							</ol>
						</div>
					</GlassPanel>
				{:else}
					{#each materials as material (material)}
						<div class="sample">
							<GlassSurface
								class="sample-pane"
								{material}
								data-lens-ready={material === 'lens' && showLens && (shaderActive || lensReady) ? '' : undefined}
								data-lens={material === 'lens' && showLens ? '' : undefined}
								onpointerenter={(event) => {
									if (material === 'lens') {
										lensHovered =
											event.pointerType === 'mouse' &&
											matchMedia('(hover: hover) and (pointer: fine)').matches;
									}
								}}
								onpointerleave={() => {
									if (material === 'lens') lensHovered = false;
								}}
								aria-hidden="true"
							/>
							<h2>{material === 'lens' ? (solid ? 'Solid override' : 'Lens') : 'Solid'}</h2>
						</div>
					{/each}
				{/if}
			</div>
			<div class="scene-footer">
				<p>
					{backdropLabel}{#if photo} <span>· Drag to reposition</span>{/if}{#if showLens && !shaderActive && !lensReady && !componentLensReady}
						· Lens using frost{/if}
				</p>
				{#if backdrop === 'hibiscus'}
					<a
						href="https://unsplash.com/photos/close-up-of-a-vibrant-orange-and-purple-hibiscus-flower-eyL9MbS8oAY"
					>
						Tey Lovius on Unsplash
					</a>
				{:else if backdrop === 'photo'}
					<a href="https://unsplash.com/photos/water-droplets-on-green-leaf-m2cNS2FXuOk">
						Mark Olsen on Unsplash
					</a>
				{:else if backdrop === 'rain'}
					<GlassButton
						class="rain-control"
						material="embedded"
						onclick={() => (rainPaused = !rainPaused)}
					>
						{rainPaused ? 'Resume rain' : 'Pause rain'}
					</GlassButton>
				{/if}
			</div>
		</section>

		<aside class="settings" aria-labelledby="controls-heading">
			<GlassPanel class="control-panel" material="solid">
				<h2 id="controls-heading">Controls</h2>
				<fieldset class="scene-selector">
					<legend>Backdrop</legend>
					<div class="scenes">
						{#each backdrops as option (option.value)}
							<label class="scene">
								<input type="radio" name="backdrop" value={option.value} bind:group={backdrop} />
								<span>{option.label}</span>
							</label>
						{/each}
					</div>
				</fieldset>
				<fieldset>
					<legend>Appearance</legend>
					<label>
						<select aria-label="Appearance" bind:value={appearance}>
							<option value="system">System</option><option value="light">Light</option><option
								value="dark"
							>
								Dark
							</option>
						</select>
					</label>
				</fieldset>
				<fieldset>
					<legend>Lens</legend>
					<label class="blur">
						Blur <output aria-hidden="true">{blur} px</output>
						<input aria-label="Blur" aria-valuetext={`${blur} px`} type="range" min="0" max="32" bind:value={blur} />
					</label>
					<label class="blur ripple">
						Ripple strength <output aria-hidden="true">{ripple}</output>
						<input
							aria-label="Ripple strength"
							type="range"
							min="0"
							max="45"
							bind:value={ripple}
							disabled={!opticsReady || !refract}
						/>
					</label>
					<label class="refraction-control">
						<input type="checkbox" bind:checked={refract} disabled={!opticsReady} />
						Refraction
					</label>
					<label class="refraction-control">
						<input type="checkbox" bind:checked={solid} />
						Force solid
					</label>
				</fieldset>
			</GlassPanel>
		</aside>
	</div>
</GlassProvider>

<style>
	:global(body) {
		margin: 0;
		font-family: Inter, system-ui, sans-serif;
	}
	:global(.playground) {
		--ink: light-dark(#1c2921, #edf4ea);
		--muted: light-dark(#47594e, #b0c1b6);
		--line: light-dark(#b4c1b2, #465a4e);
		--accent: light-dark(#28583e, #b8e6c8);
		--paper: light-dark(#f1f3e9, #161e19);
		--field: light-dark(#f8faf3, #18251f);
		--well: light-dark(#e6ece0, #222f27);
		--selected: light-dark(#d3e4d4, #354e3d);
		--glass-focus: var(--accent);
		min-height: 100svh;
		padding: 0 clamp(14px, 4vw, 60px) 48px;
		background: var(--paper);
		color: var(--ink);
	}
	.header,
	.intro,
	.workspace {
		max-inline-size: 1280px;
		margin-inline: auto;
	}
	.header {
		min-height: 62px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 15px;
		border-bottom: 1px solid var(--line);
	}
	.brand {
		display: inline-flex;
		align-items: center;
	}
	.brand img {
		display: block;
	}
	.header nav {
		display: flex;
		flex-wrap: wrap;
		justify-content: end;
		gap: 4px clamp(10px, 2vw, 24px);
	}
	.header a,
	.scene-footer a {
		color: var(--accent);
		text-underline-offset: 4px;
	}
	.header nav a {
		display: inline-flex;
		align-items: center;
		min-block-size: 44px;
		font-size: 0.85rem;
	}

	.intro {
		padding-block: clamp(24px, 4vw, 48px) 24px;
	}
	h1,
	h2,
	p {
		margin: 0;
	}
	h1 {
		font-size: clamp(2rem, 1.35rem + 2.5vw, 4rem);
		font-weight: 680;
		line-height: 1.02;
		letter-spacing: -0.065em;
	}
	.intro p {
		margin-block-start: 10px;
		color: var(--muted);
	}
	.workspace {
		display: grid;
		grid-template-columns: minmax(0, 1fr) clamp(260px, 24vw, 320px);
		align-items: start;
		gap: clamp(12px, 2vw, 24px);
	}
	.specimen {
		border: 1px solid var(--line);
		--preview-radius: 20px;
		--preview-inset: 10px;
		border-radius: var(--preview-radius);
		background: var(--field);
		container-type: inline-size;
	}
	.preview-toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 8px 12px;
		padding: 10px clamp(12px, 2vw, 20px);
	}
	.preview-toolbar h2,
	.settings h2 {
		font-size: 1.15rem;
		font-weight: 700;
		letter-spacing: -0.025em;
	}
	.preset-picker {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 6px 10px;
		color: var(--muted);
		font-size: 0.85rem;
	}
	.preset-picker select {
		max-inline-size: 100%;
	}
	fieldset {
		min-inline-size: 0;
		margin: 0;
		padding: 0;
		border: 0;
	}
	legend {
		padding: 0;
		font-weight: 650;
	}
	.scenes {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 6px;
	}

	.scene {
		position: relative;
		cursor: pointer;
	}
	.scene input {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		opacity: 0;
	}
	.scene span {
		display: grid;
		place-items: center;
		min-block-size: 44px;
		padding-inline: 3px;
		border: 1px solid var(--line);
		border-radius: 8px;
		font-size: 0.8rem;
		text-align: center;
	}
	.scene input:checked + span {
		color: var(--accent);
		background: var(--selected);
		border-color: var(--accent);
		font-weight: 650;
	}
	.scene input:focus-visible + span {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}
	@media (hover: hover) {
		.scene:hover span {
			border-color: var(--accent);
		}
	}
	@media (forced-colors: active) {
		.scene input:checked + span {
			border-color: Highlight;
		}
	}
	.stage {
		position: relative;
		overflow: clip;
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 215px));
		justify-content: center;
		align-content: center;
		gap: clamp(12px, 5cqi, 48px);
		min-block-size: clamp(270px, 62cqi, 530px);
		margin-inline: var(--preview-inset);
		border-radius: calc(var(--preview-radius) - var(--preview-inset));
		box-sizing: border-box;
		padding: clamp(14px, 4cqi, 36px);
		background: #a7a2dd;
	}
	.scene-footer {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		gap: 6px 12px;
		min-block-size: 50px;
		padding-inline: clamp(14px, 2vw, 24px);
		color: var(--muted);
		font-size: 0.82rem;
	}
	.stage.component-preset {
		grid-template-columns: minmax(0, 720px);
	}
	.panel-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin-block-start: 20px;
	}
	.button-grid {
		display: grid;
		grid-template-columns: repeat(6, minmax(0, 1fr));
		justify-self: center;
		inline-size: min(100%, 430px);
		gap: 8px;
	}
	.button-grid :global(.glass-button) {
		justify-content: center;
		padding-inline: 4px;
		font-variant-numeric: tabular-nums;
	}
	@container (inline-size < 355px) {
		.button-grid {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
	}
	.scroll-sample {
		max-block-size: 196px;
		overflow: auto;
	}
	.scroll-sample ol {
		margin-block: 0;
	}
	.scroll-sample li {
		padding: 8px;
	}
	.stage.has-lens .art {
		visibility: hidden;
	}
	.stage.has-lens .rain rect {
		animation: none;
	}
	.photo-drag {
		position: absolute;
		inset: 0;
		cursor: grab;
		touch-action: none;
	}
	.photo-drag.dragging {
		cursor: grabbing;
	}
	.photo-drag:focus-visible {
		outline-offset: -5px;
	}
	.component-filter {
		position: absolute;
		pointer-events: none;
	}
	@media (forced-colors: none) and (not (prefers-reduced-transparency: reduce)) {
		.stage :global([data-material='lens']) {
			box-shadow: 0 0 0 2px #ffffff99;
		}
		.stage.has-lens :global(:is([data-lens], [data-component-lens])[data-material='lens']) {
			backdrop-filter: none;
		}
		.stage.has-component-lens :global([data-component-lens][data-material='lens']) {
			backdrop-filter: blur(var(--glass-blur, 4px)) var(--component-lens-filter);
		}
		.stage.has-svg-lens :global([data-lens]) {
			backdrop-filter: url(#glassform-svg-lens);
		}
	}
	.art {
		position: absolute;
		inset: 0;
		overflow: clip;
		pointer-events: none;
	}
	.art i {
		position: absolute;
		display: block;
		width: 75%;
		height: 92%;
		left: -14%;
		top: -28%;
		transform: rotate(-27deg);
		border-radius: 48%;
		background: repeating-linear-gradient(
			90deg,
			#6d47c7 0 12px,
			#aa75ef 12px 26px,
			#d2bbf9 26px 38px
		);
	}
	.art i:nth-child(2) {
		top: 24%;
		left: 38%;
		transform: rotate(30deg);
		background: repeating-linear-gradient(
			90deg,
			#ff9563 0 16px,
			#ffc088 16px 28px,
			#f7dcaa 28px 39px
		);
	}
	.art i:nth-child(3) {
		top: 62%;
		left: -13%;
		transform: rotate(12deg);
		background: repeating-linear-gradient(88deg, #4d64a1 0 11px, #86a3de 11px 23px);
	}
	[data-backdrop='grid'] .art {
		background: repeating-conic-gradient(#e6dffa 0% 25%, #56438a 0% 50%) 0 0 / 40px 40px;
	}
	:is([data-backdrop='photo'], [data-backdrop='meadow'], [data-backdrop='hibiscus']) {
		background: #102c22;
	}
	.leaf-photo {
		position: absolute;
		left: var(--photo-left);
		top: var(--photo-top);
		width: var(--photo-size);
		height: var(--photo-size);
		object-fit: cover;
	}
	[data-backdrop='rain'] .art {
		background:
			radial-gradient(ellipse at 25% 28%, light-dark(#e1f5ff, #496d89), transparent 50%),
			radial-gradient(ellipse at 77% 79%, light-dark(#a3a9dc, #584f75), transparent 52%),
			linear-gradient(
				145deg,
				light-dark(#c2dbec, #172943),
				light-dark(#a8cbe5, #263656) 65%,
				light-dark(#dceafa, #16253e)
			);
	}
	.rain {
		position: absolute;
		inset: -144px -64px 0;
		width: calc(100% + 128px);
		height: calc(100% + 144px);
		transform: skew(-9deg);
	}
	.rain path {
		stroke: light-dark(#28456e, #d7efff);
		stroke-width: 4;
		stroke-linecap: round;
	}
	.rain-far {
		opacity: 0.28;
		transform: translate(-23px, 24px);
	}
	.rain-near {
		opacity: 0.88;
	}
	@media (prefers-reduced-motion: no-preference) {
		.rain-near {
			animation: rain-fall 520ms linear infinite;
		}
		.rain-far {
			animation: rain-fall 910ms linear infinite;
		}
		.rain.paused rect {
			animation-play-state: paused;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.scene-footer :global(.rain-control) {
			display: none;
		}
	}
	@keyframes rain-fall {
		to {
			translate: 0 144px;
		}
	}
	[data-backdrop='flat'] .art {
		background: #a7a2dd;
	}
	[data-backdrop]:not([data-backdrop='prism']) .art i {
		display: none;
	}
	.stage :global(.glass-surface) {
		position: relative;
	}
	.sample {
		display: grid;
		justify-items: center;
		align-content: center;
		gap: 9px;
		min-width: 0;
	}
	.stage :global(.sample-pane) {
		inline-size: 100%;
		aspect-ratio: 1;
		box-sizing: border-box;
		--glass-radius: 50%;
		--glass-rim: light-dark(#faffefc7, #faffef9c);
	}
	.stage :global(.sample-pane[data-material='solid']) {
		background: var(--well);
	}
	.sample h2 {
		z-index: 0;
		padding: 4px 10px;
		border-radius: 999px;
		background: var(--field);
		color: var(--ink);
		text-align: center;
		font-size: clamp(0.75rem, 1.4vw, 0.9rem);
		font-weight: 650;
	}
	.settings :global(.control-panel) {
		--glass-panel-padding: 16px;
		--glass-radius: 20px;
		--glass-rim: var(--line);
		background: var(--field);
		color: var(--ink);
		box-shadow: none;
	}
	.settings h2 {
		margin-block-end: 14px;
	}
	.settings fieldset + fieldset {
		margin-block-start: 14px;
	}
	.settings legend {
		inline-size: 100%;
		border-block-start: 1px solid var(--line);
		padding-block: 9px 5px;
		font-size: 0.85rem;
		font-weight: 650;
	}

	.settings label {
		display: grid;
		align-items: center;
		gap: 5px 6px;
		margin-block-start: 6px;
		font-size: 0.82rem;
		color: var(--muted);
	}
	select,
	input {
		min-width: 0;
		font: inherit;
		accent-color: var(--accent);
	}
	select {
		min-height: 44px;
		padding: 5px 10px;
		color: var(--ink);
		border: 1px solid var(--line);
		border-radius: 8px;
		background: var(--well);
	}
	.settings .scene {
		margin: 0;
	}
	.settings .refraction-control {
		display: flex;
		min-height: 32px;
		width: fit-content;
	}
	.refraction-control input {
		width: 1rem;
		height: 1rem;
		margin: 0 3px 0 0;
	}
	.blur {
		grid-template-columns: minmax(0, 1fr) auto;
	}
	.blur input {
		grid-column: 1 / -1;
		width: 100%;
		margin: 0;
		min-height: 28px;
	}
	.blur output {
		font-variant-numeric: tabular-nums;
		color: var(--ink);
	}
	:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 3px;
	}
	@media (max-width: 880px) {
		.workspace {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
