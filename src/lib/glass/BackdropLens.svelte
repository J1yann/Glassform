<script lang="ts">
	import { onMount } from 'svelte';
	import { lensDisplacementMap } from './lens-profile';
	import { createBackdropLens, maxLenses, type LensBackdrop } from './backdrop-lens';

	let {
		appearance,
		circular = false,
		strength = 1,
		backdrop = 'rain',
		optical = false,
		trackPointer = false,
		autoDiscover = false,
		ripple = 0,
		paused,
		blur,
		refract,
		photoX,
		photoY,
		onUnavailable,
		ready = $bindable(false)
	}: {
		circular?: boolean;
		strength?: number;
		backdrop?: LensBackdrop;
		optical?: boolean;
		trackPointer?: boolean;
		autoDiscover?: boolean;
		ripple?: number;
		appearance: 'system' | 'light' | 'dark';
		paused: boolean;
		blur: number;
		refract: boolean;
		photoX: number;
		photoY: number;
		onUnavailable?: () => void;
		ready?: boolean;
	} = $props();

	let canvas: HTMLCanvasElement;
	let sync:
		| ((
				isDark: boolean,
				isPaused: boolean,
				amount: number,
				refract: boolean,
				photoX: number,
				photoY: number,
				strength: number,
				ripple: number
		  ) => void)
		| undefined;

	$effect(() => {
		const nextAppearance = appearance;
		const nextPaused = paused;
		const nextBlur = blur;
		const nextRefraction = refract;
		const nextPhotoX = photoX;
		const nextPhotoY = photoY;
		const nextStrength = strength;
		const nextRipple = ripple;
		sync?.(
			nextAppearance === 'dark' ||
				(nextAppearance === 'system' && matchMedia('(prefers-color-scheme: dark)').matches),
			nextPaused,
			nextBlur,
			nextRefraction,
			nextPhotoX,
			nextPhotoY,
			nextStrength,
			nextRipple
		);
	});

	onMount(() => {
		const element = canvas;
		ready = false;
		const stage = element.parentElement;
		if (!stage) return;
		const photo = stage.querySelector<HTMLImageElement>(autoDiscover ? ':scope > .leaf-photo' : '.leaf-photo');
		const tracked = new Set<HTMLElement>();
		let lenses: HTMLElement[] = [];

		const scheme = matchMedia('(prefers-color-scheme: dark)');
		const motion = matchMedia('(prefers-reduced-motion: reduce)');
		const solid = matchMedia('(forced-colors: active), (prefers-reduced-transparency: reduce)');
		let renderer: ReturnType<typeof createBackdropLens>;
		let frame = 0;
		let previous = 0;
		let elapsed = 0;
		let dirty = true;
		let visible = false;
		let isDark = false;
		let isPaused = false;
		let amount = 4;
		let bending = true;
		let imageX = 50;
		let imageY = 50;
		let refractionStrength = 1;
		let rippleAmount = 0;
		let light: [number, number] = [0, 0];
		let pointerInside = false;
		const map = new Image();
		map.addEventListener('load', syncPreferences);
		map.src = lensDisplacementMap;

		function requestDraw() {
			if (!frame && visible && renderer && !solid.matches && !document.hidden) {
				frame = requestAnimationFrame(draw);
			}
		}

		function draw(now: number) {
			frame = 0;
			if (!renderer || !visible || solid.matches || document.hidden) return;
			const animate = !photo && backdrop === 'rain' && !motion.matches && !isPaused;
			if (animate && previous) elapsed += Math.min(now - previous, 40) / 1000;
			previous = animate ? now : 0;
			if (animate || dirty) {
				renderer.draw(elapsed, isDark, amount, bending, imageX, imageY, refractionStrength, light, rippleAmount);
				dirty = false;
				ready = true;
			}
			if (animate) requestDraw();
		}

		function resize() {
			if (!renderer || !stage || !lenses) return;
			const stageRect = stage.getBoundingClientRect();
			const scale = Math.min(devicePixelRatio, photo ? 2 : 1.25);
			const bounds = lenses.map((lens) => {
				const rect = lens.getBoundingClientRect();
				const rawRadius = getComputedStyle(lens).borderTopLeftRadius;
				const shortSide = Math.min(rect.width, rect.height);
				const radius = rawRadius.endsWith('%')
					? shortSide * (parseFloat(rawRadius) / 100)
					: parseFloat(rawRadius) || 0;
				return {
					lens,
					rect: new DOMRect(
						rect.left - stageRect.left,
						rect.top - stageRect.top,
						rect.width,
						rect.height
					),
					radius: circular ? shortSide / 2 : radius,
					circular: circular || (Math.abs(rect.width - rect.height) < 1 && radius >= shortSide / 2)
				};
			}).filter(({ rect }) => rect.width > 0 && rect.height > 0).slice(0, maxLenses);
			if (autoDiscover) {
				const rendered = new Set(bounds.map(({ lens }) => lens));
				for (const lens of lenses) lens.toggleAttribute('data-lens-stage-rendered', rendered.has(lens));
			}
			renderer.resize(stageRect.width, stageRect.height, scale, bounds);
			if (!pointerInside || motion.matches) light = [stageRect.width * 0.3, -stageRect.height * 0.2];
			dirty = true;
			requestDraw();
		}

		function moveLight(event: PointerEvent) {
			if (!stage || motion.matches || event.pointerType === 'touch') return;
			const bounds = stage.getBoundingClientRect();
			pointerInside = true;
			light = [event.clientX - bounds.left, event.clientY - bounds.top];
			dirty = true;
			requestDraw();
		}

		function resetLight() {
			pointerInside = false;
			if (!stage) return;
			light = [stage.clientWidth * 0.3, -stage.clientHeight * 0.2];
			dirty = true;
			requestDraw();
		}

		function syncPreferences() {
			isDark = appearance === 'dark' || (appearance === 'system' && scheme.matches);
			previous = 0;
			dirty = true;
			if (solid.matches) {
				ready = false;
				return;
			}
			if (photo && (!photo.complete || !photo.naturalWidth)) return;
			if (!map.complete || !map.naturalWidth) return;
			renderer ??= createBackdropLens(element, map, photo ?? undefined, backdrop, optical);
			if (!renderer) onUnavailable?.();
			resize();
		}

		function photoLoaded() {
			if (renderer && photo && !renderer.uploadPhoto(photo)) {
				photoFailed();
				return;
			}
			syncPreferences();
		}

		function photoFailed() {
			renderer?.dispose();
			renderer = undefined;
			ready = false;
			onUnavailable?.();
		}

		function contextLost(event: Event) {
			event.preventDefault();
			cancelAnimationFrame(frame);
			frame = 0;
			renderer = undefined;
			ready = false;
		}

		function visibilityChanged() {
			previous = 0;
			requestDraw();
		}

		sync = (nextDark, nextPaused, nextBlur, nextRefraction, nextPhotoX, nextPhotoY, nextStrength, nextRipple) => {
			isDark = nextDark;
			if (isPaused !== nextPaused) previous = 0;
			isPaused = nextPaused;
			amount = nextBlur;
			bending = nextRefraction;
			imageX = nextPhotoX;
			imageY = nextPhotoY;
			refractionStrength = nextStrength;
			rippleAmount = nextRipple;
			dirty = true;
			requestDraw();
		};
		sync(
			appearance === 'dark' || (appearance === 'system' && scheme.matches),
			paused,
			blur,
			refract,
			photoX,
			photoY,
			strength,
			ripple
		);
		const size = new ResizeObserver(resize);
		const position = new MutationObserver(() => {
			if (autoDiscover) discover();
			resize();
		});
		function discover() {
			if (!stage) return;
			const selector = autoDiscover ? "[data-material='lens']" : '[data-lens], [data-component-lens]';
			lenses = Array.from(stage.querySelectorAll<HTMLElement>(selector)).filter(
				(lens) => !autoDiscover || lens.closest('[data-glass-lens-stage]') === stage
			);
			const next = new Set<HTMLElement>([stage]);
			for (const lens of lenses) {
				next.add(lens);
				if (lens.parentElement) next.add(lens.parentElement);
			}
			for (const element of tracked) {
				if (next.has(element)) continue;
				size.unobserve(element);
				element.removeAttribute('data-lens-stage-rendered');
				tracked.delete(element);
			}
			for (const element of next) {
				if (tracked.has(element)) continue;
				size.observe(element);
				tracked.add(element);
			}
		}
		discover();
		if (autoDiscover) {
			position.observe(stage, {
				subtree: true,
				childList: true,
				attributes: true,
				attributeFilter: ['data-material', 'style', 'class']
			});
		} else {
			for (const lens of lenses) position.observe(lens, { attributes: true, attributeFilter: ['style'] });
		}
		syncPreferences();
		const intersection = new IntersectionObserver(([entry]) => {
			visible = entry.isIntersecting;
			visibilityChanged();
		});
		intersection.observe(stage);
		photo?.addEventListener('load', photoLoaded);
		photo?.addEventListener('error', photoFailed);
		if (optical && trackPointer) {
			stage.addEventListener('pointermove', moveLight, { passive: true });
			stage.addEventListener('pointerleave', resetLight);
		}
		document.addEventListener('visibilitychange', visibilityChanged);
		element.addEventListener('webglcontextlost', contextLost);
		element.addEventListener('webglcontextrestored', syncPreferences);
		for (const preference of [scheme, motion, solid])
			preference.addEventListener('change', syncPreferences);
		return () => {
			cancelAnimationFrame(frame);
			size.disconnect();
			position.disconnect();
			intersection.disconnect();
			for (const preference of [scheme, motion, solid])
				preference.removeEventListener('change', syncPreferences);
			map.removeEventListener('load', syncPreferences);
			photo?.removeEventListener('load', photoLoaded);
			photo?.removeEventListener('error', photoFailed);
			if (autoDiscover) for (const lens of lenses) lens.removeAttribute('data-lens-stage-rendered');
			stage.removeEventListener('pointermove', moveLight);
			stage.removeEventListener('pointerleave', resetLight);
			document.removeEventListener('visibilitychange', visibilityChanged);
			element.removeEventListener('webglcontextlost', contextLost);
			element.removeEventListener('webglcontextrestored', syncPreferences);
			renderer?.dispose();
			ready = false;
		};
	});
</script>

<canvas bind:this={canvas} class:ready aria-hidden="true"></canvas>

<style>
	canvas {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		display: block;
		visibility: hidden;
		pointer-events: none;
	}
	canvas.ready {
		visibility: visible;
	}
</style>
