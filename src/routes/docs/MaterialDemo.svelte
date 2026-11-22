<script lang="ts">
	import { GlassSurface, LensStage } from '#lib';
	import { defaultLensBlur } from '../../lib/glass/lens-profile';

	const blur = defaultLensBlur;
</script>

<div class="bento" style:--glass-blur={`${blur}px`}>
	<figure class="lens-tile">
		<LensStage
			class="hero-lens-stage"
			photo={{
				src: '/images/chicago-facade-720.webp',
				srcset: '/images/chicago-facade-720.webp 720w, /images/chicago-facade-1440.webp 1440w',
				sizes: '(max-width: 480px) 92vw, (max-width: 800px) 53vw, 420px',
				width: 720,
				height: 721,
				alt: 'Geometric window lines on a Chicago building'
			}}
		>
			<GlassSurface class="pane lens-pane" material="lens" aria-hidden="true" />
		</LensStage>
		<figcaption>
			<strong>Lens · 4 px</strong>
			<a
				href="https://unsplash.com/photos/modern-building-facade-with-repeating-geometric-patterns-2XaVAwIHqZE"
			>
				Matthew Jackson on Unsplash
			</a>
		</figcaption>
	</figure>

	<figure class="frost-tile">
		<LensStage
			class="frost-stage"
			refract={false}
			photo={{
				src: '/images/leaf-after-rain-720.webp',
				srcset: '/images/leaf-after-rain-720.webp 720w, /images/leaf-after-rain-1440.webp 1440w',
				sizes: '(max-width: 480px) 92vw, (max-width: 800px) 39vw, 310px',
				width: 720,
				height: 960,
				fetchpriority: 'high',
				alt: 'Water droplets on a green leaf'
			}}
		>
			<GlassSurface class="pane frost-pane" material="lens" aria-hidden="true" />
		</LensStage>
		<figcaption>
			<strong>Soft Lens · 4 px</strong>
			<a href="https://unsplash.com/photos/water-droplets-on-green-leaf-m2cNS2FXuOk">
				Mark Olsen on Unsplash
			</a>
		</figcaption>
	</figure>
</div>

<style>
	.bento {
		display: grid;
		grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
		align-items: start;
		gap: clamp(10px, 1.3vw, 18px);
	}
	figure {
		margin: 0;
		min-width: 0;
	}
	.frost-tile {
		margin-block-start: clamp(12px, 2vw, 28px);
	}
	figure :global(.lens-stage) {
		position: relative;
		aspect-ratio: 1.1;
		border-radius: var(--glass-radius, 24px);
		overflow: clip;
		outline: 1px solid var(--outline-image);
		outline-offset: -1px;
		background: #213c32;
	}
	figure :global(.frost-stage) {
		aspect-ratio: 0.93;
	}
	figure :global(.pane) {
		position: absolute;
		inset-inline: 0;
		inset-block: 0;
		margin: auto;
		inline-size: 68%;
		block-size: 49%;
		--glass-radius: clamp(14px, 2vw, 22px);
	}
	.lens-tile :global(.lens-pane) {
		inline-size: 56%;
		block-size: auto;
		aspect-ratio: 1;
	}
	.frost-tile :global(.frost-pane) {
		inline-size: 59%;
		block-size: 55%;
	}

	figcaption {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: 2px 8px;
		margin-top: 7px;
		font-size: 0.78rem;
		color: var(--muted);
	}
	figcaption strong {
		color: var(--ink);
	}
	a {
		color: inherit;
		text-underline-offset: 3px;
	}
	@media (max-width: 480px) {
		.bento {
			grid-template-columns: minmax(0, 1fr);
		}
		.frost-tile {
			margin-block-start: 0;
		}
		figure :global(.lens-stage) {
			aspect-ratio: 1.55;
		}
	}
</style>
