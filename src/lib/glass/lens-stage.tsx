'use client';

import { useEffect, useId, useRef, useState } from 'react';
import type { ComponentPropsWithoutRef, CSSProperties } from 'react';
import { createBackdropLens, maxLenses, photoOverscan } from './backdrop-lens';
import { defaultLensBlur, lensDisplacementMap } from './lens-profile';
import './react-stage.css';

type Photo = Pick<
	ComponentPropsWithoutRef<'img'>,
	'srcSet' | 'sizes' | 'width' | 'height' | 'alt' | 'loading' | 'fetchPriority' | 'crossOrigin'
> & { src: string };

type LensStageProps = ComponentPropsWithoutRef<'div'> & {
	photo: Photo;
	blur?: number;
	ripple?: number;
	refract?: boolean;
	trackPointer?: boolean;
	photoX?: number;
	photoY?: number;
};

export function LensStage({
	photo,
	blur = defaultLensBlur,
	ripple = 0,
	refract = true,
	trackPointer = false,
	photoX = 50,
	photoY = 50,
	className,
	style,
	children,
	...props
}: LensStageProps) {
	const stageRef = useRef<HTMLDivElement>(null);
	const photoRef = useRef<HTMLImageElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const settings = useRef({ blur, ripple, photoX, photoY });
	const requestDraw = useRef<() => void>(() => {});
	const [ready, setReady] = useState(false);
	const [useSvg, setUseSvg] = useState(false);
	const id = useId();
	const filterId = `${id}-glassform`;

	useEffect(() => {
		setUseSvg(
			/Chrom(e|ium)\//.test(navigator.userAgent) &&
				CSS.supports('backdrop-filter', `url(#${filterId})`)
		);
	}, [filterId]);

	useEffect(() => {
		settings.current = { blur, ripple, photoX, photoY };
		requestDraw.current();
	}, [blur, ripple, photoX, photoY]);

	useEffect(() => {
		const stage = stageRef.current;
		const canvas = canvasRef.current;
		const image = photoRef.current;
		setReady(false);
		if (!refract || !stage || !canvas || !image) return;

		const reduceTransparency = matchMedia(
			'(forced-colors: active), (prefers-reduced-transparency: reduce)'
		);
		const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
		const map = new Image();
		let renderer: ReturnType<typeof createBackdropLens>;
		let frame = 0;
		let visible = false;
		let lost = false;
		let pointer: [number, number] | undefined;
		let marked = new Set<HTMLElement>();

		function schedule() {
			if (!frame && visible && !document.hidden) frame = requestAnimationFrame(draw);
		}

		function draw() {
			frame = 0;
			if (!stage || !canvas || !image || lost || !visible || document.hidden) return;
			if (
				reduceTransparency.matches ||
				!image.complete ||
				!image.naturalWidth ||
				!map.complete ||
				!map.naturalWidth
			) {
				setReady(false);
				return;
			}
			renderer ??= createBackdropLens(canvas, map, image, 'rain', true);
			if (!renderer) return;

			const stageBox = stage.getBoundingClientRect();
			if (!stageBox.width || !stageBox.height) return;
			const scale = Math.min(devicePixelRatio || 1, 2);
			const bounds = Array.from(stage.querySelectorAll<HTMLElement>('[data-material=lens]'))
				.filter((surface) => surface.closest('[data-glass-lens-stage]') === stage)
				.flatMap((surface) => {
					const rect = surface.getBoundingClientRect();
					if (!rect.width || !rect.height) return [];
					const raw = getComputedStyle(surface).borderTopLeftRadius;
					const shortSide = Math.min(rect.width, rect.height);
					const radius = raw.endsWith('%')
						? (shortSide * parseFloat(raw)) / 100
						: parseFloat(raw) || 0;
					return [
						{
							surface,
							rect: new DOMRect(
								rect.left - stageBox.left,
								rect.top - stageBox.top,
								rect.width,
								rect.height
							),
							radius,
							circular: Math.abs(rect.width - rect.height) < 1 && radius >= shortSide / 2
						}
					];
				})
				.slice(0, maxLenses);

			const next = new Set(bounds.map(({ surface }) => surface));
			for (const surface of marked)
				if (!next.has(surface)) surface.removeAttribute('data-lens-stage-rendered');
			for (const surface of next) surface.setAttribute('data-lens-stage-rendered', '');
			marked = next;
			renderer.resize(stageBox.width, stageBox.height, scale, bounds);
			const state = settings.current;
			const light =
				!reduceMotion.matches && pointer
					? pointer
					: ([stageBox.width * 0.3, -stageBox.height * 0.2] as const);
			renderer.draw(0, false, state.blur, true, state.photoX, state.photoY, 1, light, state.ripple);
			setReady(true);
		}

		function photoLoaded() {
			if (renderer && image && !renderer.uploadPhoto(image)) {
				renderer.dispose();
				renderer = undefined;
				setReady(false);
			}
			schedule();
		}

		function contextLost(event: Event) {
			event.preventDefault();
			lost = true;
			renderer = undefined;
			setReady(false);
		}

		function contextRestored() {
			lost = false;
			schedule();
		}

		function moveLight(event: PointerEvent) {
			if (!stage || reduceMotion.matches || event.pointerType === 'touch') return;
			const rect = stage.getBoundingClientRect();
			pointer = [event.clientX - rect.left, event.clientY - rect.top];
			schedule();
		}

		function resetLight() {
			pointer = undefined;
			schedule();
		}

		const resize = new ResizeObserver(schedule);
		const observed = new Set<Element>();
		function observeGeometry() {
			if (!stage) return;
			const next = new Set<Element>([
				stage,
				...stage.querySelectorAll('[data-material=lens], .glass-react-foreground')
			]);
			for (const target of observed)
				if (!next.has(target)) {
					resize.unobserve(target);
					observed.delete(target);
				}
			for (const target of next)
				if (!observed.has(target)) {
					resize.observe(target);
					observed.add(target);
				}
			schedule();
		}
		const mutations = new MutationObserver(observeGeometry);
		const intersection = new IntersectionObserver(([entry]) => {
			visible = entry.isIntersecting;
			schedule();
		});
		mutations.observe(stage, {
			subtree: true,
			childList: true,
			attributes: true,
			attributeFilter: ['style', 'class', 'data-material']
		});
		observeGeometry();
		intersection.observe(stage);
		document.addEventListener('visibilitychange', schedule);
		reduceTransparency.addEventListener('change', schedule);
		reduceMotion.addEventListener('change', resetLight);
		image.addEventListener('load', photoLoaded);
		image.addEventListener('error', schedule);
		canvas.addEventListener('webglcontextlost', contextLost);
		canvas.addEventListener('webglcontextrestored', contextRestored);
		if (trackPointer) {
			stage.addEventListener('pointermove', moveLight, { passive: true });
			stage.addEventListener('pointerleave', resetLight);
		}
		map.addEventListener('load', schedule);
		map.src = lensDisplacementMap;
		requestDraw.current = schedule;
		return () => {
			cancelAnimationFrame(frame);
			requestDraw.current = () => {};
			resize.disconnect();
			mutations.disconnect();
			intersection.disconnect();
			document.removeEventListener('visibilitychange', schedule);
			reduceTransparency.removeEventListener('change', schedule);
			reduceMotion.removeEventListener('change', resetLight);
			map.removeEventListener('load', schedule);
			image.removeEventListener('load', photoLoaded);
			image.removeEventListener('error', schedule);
			canvas.removeEventListener('webglcontextlost', contextLost);
			canvas.removeEventListener('webglcontextrestored', contextRestored);
			stage.removeEventListener('pointermove', moveLight);
			stage.removeEventListener('pointerleave', resetLight);
			for (const surface of marked) surface.removeAttribute('data-lens-stage-rendered');
			renderer?.dispose();
		};
	}, [photo.src, photo.crossOrigin, refract, trackPointer]);

	const svgFallback = useSvg && refract && !ready;
	const stageStyle = {
		...style,
		'--glass-blur': `${Math.max(0, blur)}px`,
		'--glass-react-svg': `url(#${filterId})`
	} as CSSProperties;
	const photoSize = `${photoOverscan * 100}%`;
	return (
		<div
			{...props}
			ref={stageRef}
			className={['glass-react-stage', className].filter(Boolean).join(' ')}
			style={stageStyle}
			data-glass-lens-stage=""
			data-glass-rendered={ready && refract}
			data-glass-svg={svgFallback}
		>
			<img
				{...photo}
				ref={photoRef}
				className="glass-react-photo"
				alt={photo.alt ?? ''}
				style={{
					left: `${(1 - photoOverscan) * photoX}%`,
					top: `${(1 - photoOverscan) * photoY}%`,
					width: photoSize,
					height: photoSize,
					objectPosition: `${photoX}% ${photoY}%`
				}}
			/>
			{refract && <canvas ref={canvasRef} className="glass-react-canvas" aria-hidden="true" />}
			{svgFallback && (
				<svg className="glass-react-filter" aria-hidden="true" width="0" height="0">
					<filter id={filterId} primitiveUnits="objectBoundingBox" colorInterpolationFilters="sRGB">
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
							scale={1}
							xChannelSelector="R"
							yChannelSelector="G"
							result="bent"
						/>
						{ripple > 0 && (
							<>
								<feTurbulence
									type="fractalNoise"
									baseFrequency="4 3"
									numOctaves={2}
									result="ripple-map"
								/>
								<feDisplacementMap
									in="bent"
									in2="ripple-map"
									scale={ripple / 240}
									xChannelSelector="R"
									yChannelSelector="G"
								/>
							</>
						)}
					</filter>
				</svg>
			)}
			<div className="glass-react-foreground">{children}</div>
		</div>
	);
}
