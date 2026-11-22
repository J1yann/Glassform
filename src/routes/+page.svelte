<script lang="ts">
	import { resolve } from '$app/paths';
	import logo from '#lib/assets/glassform-mark.png';
	import { onMount } from 'svelte';
	import { GlassButton, GlassPanel, GlassProvider, LensStage } from '#lib';
	import MaterialDemo from './docs/MaterialDemo.svelte';
	import CodeBlock from './docs/CodeBlock.svelte';
	import EverydayDemo from './docs/EverydayDemo.svelte';
	import { defaultLensBlur } from '../lib/glass/lens-profile';

	let applied = $state(false);
	let installOrigin = $state('https://glassform.pages.dev');
	onMount(() => {
		installOrigin = window.location.origin;
	});
	const sections = [
		['materials', 'Materials'],
		['installation', 'Installation'],
		['components', 'Components'],
		['theming', 'Theming'],
		['lens', 'Lens rendering']
	] as const;

	const example = `<script lang="ts">
  import GlassProvider from '$lib/components/glassform/GlassProvider.svelte';
  import GlassPanel from '$lib/components/glassform/GlassPanel.svelte';
  import GlassButton from '$lib/components/glassform/GlassButton.svelte';
  import LensStage from '$lib/components/glassform/LensStage.svelte';
<${'/script>'}

<GlassProvider appearance="system">
  <LensStage photo={{ src: '/images/backdrop.webp' }}>
    <GlassPanel material="lens">
      <h2>Display settings</h2>
      <GlassButton material="embedded">Apply</GlassButton>
    </GlassPanel>
  </LensStage>
</GlassProvider>`;

	const installCommand = $derived(
		'bunx shadcn-svelte@1.8.1 add ' + new URL(resolve('/r/glassform.json'), installOrigin).href
	);
	const reactInstallCommand = $derived(
		'bunx shadcn@latest add ' + new URL(resolve('/r/glassform-react.json'), installOrigin).href
	);
	const reactExample = `import {
  GlassProvider, GlassPanel, GlassButton, LensStage
} from "@/components/glassform/glassform";

export function SettingsPanel() {
  return (
    <GlassProvider appearance="system">
      <LensStage photo={{ src: "/images/backdrop.webp" }}>
        <GlassPanel material="lens">
          <h2>Display settings</h2>
          <GlassButton material="embedded">Apply</GlassButton>
        </GlassPanel>
      </LensStage>
    </GlassProvider>
  );
}`;

	const components = [
		{
			name: 'GlassProvider',
			description:
				'Scopes appearance, blur, and Solid mode. Nested providers inherit settings they omit.',
			api: 'appearance: system | light | dark · blur: number (px) · solid: boolean · as: div | main | section'
		},
		{
			name: 'LensStage',
			description: 'Supplies a photo backdrop and automatically applies optical refraction to Lens surfaces inside it.',
			api: 'photo: { src, srcset?, sizes?, alt? } · blur: number (px) · ripple: number · refract: boolean · trackPointer: boolean'
		},
		{
			name: 'GlassSurface',
			description: 'The base surface with a shared rim and corner radius. Defaults to Lens.',
			api: 'material: lens | solid'
		},
		{
			name: 'GlassPanel',
			description:
				'A padded GlassSurface for grouping content and controls. Accepts the same props as GlassSurface.',
			api: 'material: lens | solid · --glass-panel-padding'
		},
		{
			name: 'GlassButton',
			description:
				'A native button that defaults to type="button" and the Solid material. Use embedded inside a Panel to share its blur.',
			api: 'material: solid | lens | embedded · native button attributes and events'
		}
	];

	const everydayComponents = [
		['GlassAvatar', 'src, alt, fallback initials'],
		['GlassKbd', 'Keyboard shortcut content'],
		['GlassScrollArea', 'label, --glass-scroll-max-block-size'],
		['GlassInput', 'Native input attributes, bind:value'],
		['GlassTextarea', 'Native textarea attributes, bind:value'],
		['GlassSelect', 'options, bind:value'],
		['GlassCheckbox', 'Native checkbox attributes, bind:checked'],
		['GlassSwitch', 'Native checkbox attributes, bind:checked'],
		['GlassSlider', 'min, max, step, bind:value'],
		['GlassRadioGroup', 'label, name, options, bind:value'],
		['GlassSegmentedControl', 'label, name, options, bind:value']
	] as const;

	const tokens = [
		['--glass-blur', 'Backdrop blur radius', '4px'],
		['--glass-tint', 'Translucent color behind the content', '#ffffff14'],
		['--glass-rim', 'Surface border color', 'Theme-dependent'],
		['--glass-radius', 'Surface corner radius', '24px'],
		['--glass-panel-padding', 'Panel content inset', '16–32px'],
		['--glass-button-radius', 'Button corner radius', '999px'],
		['--glass-focus', 'Keyboard focus outline color', 'Theme-dependent'],
		['--glass-motion', 'Button feedback duration', '130ms']
	];
</script>

<svelte:head>
	<title>Glassform Documentation</title>
	<meta
		name="description"
		content="Build with Glassform's Svelte components, compare glass materials on real photography, and learn how Lens refraction works."
	/>
</svelte:head>

<GlassProvider class="docs" appearance="light" blur={defaultLensBlur}>
	<a class="skip" href="#main">Skip to documentation</a>
	<header class="bar">
		<a class="brand" href={resolve('/')} aria-label="Glassform home">
			<img src={logo} alt="" width="48" height="48" />
		</a>
		<nav aria-label="Primary">
			<a href="#installation">Documentation</a>
			<a href={resolve('/playground')}>Playground</a>
		</nav>
	</header>
	<main id="main" tabindex="-1">
		<section class="hero" id="materials" aria-labelledby="title">
			<div class="hero-copy">
				<h1 id="title">Liquid glass<br />for the web.</h1>
				<p class="lead">
					Glassform ships Svelte and React components with shared glass styles and photo-backed refraction.
				</p>
				<div class="hero-links">
					<a class="primary-link" href="#installation">Get started</a>
					<a class="playground-link" href={resolve('/playground')}>Open playground</a>
				</div>
			</div>
			<MaterialDemo />
		</section>

		<div class="layout">
			<nav class="contents" aria-label="On this page">
				<p>On this page</p>
				{#each sections as [id, label] (id)}<a href={`#${id}`}>{label}</a>{/each}
			</nav>
			<div class="reference-body">
				<section id="installation">
					<h2>Installation</h2>
					<p>Run this command from a Svelte project configured for shadcn-svelte.</p>
					<CodeBlock label="Terminal" code={installCommand} />
					<p>
						The CLI uses your components alias and installs the source in its <code>glassform</code>
						folder. The CLI requires Tailwind during installation. Glassform uses plain CSS. To install
						manually, copy the files from the registry item.
						<a href={resolve('/r/glassform.json')}>Open the registry item</a>.
					</p>
					<h3>Compose a panel</h3>
					<LensStage
						class="example"
						photo={{
							src: '/images/leaf-after-rain-720.webp',
							srcset: '/images/leaf-after-rain-720.webp 720w, /images/leaf-after-rain-1440.webp 1440w',
							sizes: '(max-width: 800px) 100vw, 850px',
							width: 720,
							height: 960,
							loading: 'lazy'
						}}
					>
						<GlassPanel class="docs-example" material="lens">
							<strong>Display settings</strong>
							<GlassButton material="embedded" onclick={() => (applied = true)}>
								{applied ? 'Applied' : 'Apply'}
							</GlassButton>
						</GlassPanel>
					</LensStage>
					<CodeBlock label="DisplaySettings.svelte" code={example} />
					<p>Use your own backdrop image at the path passed to <code>LensStage</code>.</p>
					<h3 id="react">Install for React</h3>
					<p>Run this command in a React project configured for shadcn. The files go under its components alias.</p>
					<CodeBlock label="Terminal" code={reactInstallCommand} />
					<p>Supply a backdrop image to <code>LensStage</code> to enable the shared WebGL optics.</p>
					<CodeBlock label="SettingsPanel.tsx" code={reactExample} />
				</section>

				<section id="components">
					<h2>Components</h2>
					<div class="reference">
						{#each components as component (component.name)}
							<article>
								<h3>{component.name}</h3>
								<p>{component.description}</p>
								<code>{component.api}</code>
							</article>
						{/each}
					</div>
					<EverydayDemo />
					<div class="table-wrap">
						<table aria-label="Everyday UI component reference">
							<thead><tr><th scope="col">Component</th><th scope="col">Props and usage</th></tr></thead>
							<tbody>
								{#each everydayComponents as [name, api] (name)}
									<tr><th scope="row"><code>{name}</code></th><td>{api}</td></tr>
								{/each}
							</tbody>
						</table>
					</div>
					<p>Use an <code>id</code> with a matching <code>&lt;label for&gt;</code> on individual controls. Groups render their own legend. Share refraction by placing related controls in one Lens panel.</p>
				</section>

				<section id="theming">
					<h2>Theming</h2>
					<p>
						Set CSS custom properties on a Provider or an individual component. Use <code>
							appearance="system"
						</code>
						to follow the visitor's color preference. Set <code>solid</code> on a Provider for opaque
						surfaces throughout its scope.
					</p>
					<div class="table-wrap">
						<table>
							<thead>
								<tr>
									<th scope="col">Token</th><th scope="col">Purpose</th><th scope="col">Default</th>
								</tr>
							</thead>
							<tbody>
								{#each tokens as [token, purpose, value] (token)}
									<tr>
										<th scope="row"><code>{token}</code></th><td>{purpose}</td><td>{value}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</section>

				<section id="lens">
					<h2>Lens rendering</h2>
					<p>
						Place <code>material="lens"</code> surfaces inside a <code>LensStage</code> and supply a
						backdrop image once. The stage treats the image as the source for refraction and discovers
						Lens surfaces automatically. Lens surfaces outside a stage use CSS backdrop blur.
					</p>
					<ul>
						<li>
							<strong>WebGL</strong> bends the backdrop with a displacement map. Set <code>trackPointer</code>
							to enable pointer-driven highlights, or <code>refract=&#123;false&#125;</code> for a frosted finish.
						</li>
						<li>
							<strong>Fallbacks</strong> use SVG displacement where supported, or CSS backdrop blur
							when an optical renderer is unavailable.
						</li>
						<li>
							<strong>Accessibility and performance</strong> Glassform uses opaque surfaces in forced
							colors and with reduced transparency. Group controls on one filtered surface where possible.
							Device performance is still being evaluated.
						</li>
					</ul>
					<a class="play-link" href={resolve('/playground')}>
						Explore refraction in the playground
					</a>
				</section>
			</div>
		</div>
	</main>
</GlassProvider>

<style>
	:global(body) {
		margin: 0;
	}
	:global(.docs) {
		--page: #f2f3e9;
		--ink: #202a23;
		--muted: #48574d;
		--line: #bbc6b8;
		--accent: #24563e;
		--outline-image: oklch(0 0 0 / 0.1);
		--glass-focus: #24563e;
		--glass-motion: 150ms;
		--docs-ease-out: cubic-bezier(0.23, 1, 0.32, 1);
		min-height: 100vh;
		background: var(--page);
		color: var(--ink);
		font:
			1rem/1.6 Inter,
			system-ui,
			sans-serif;
	}
	:global(.docs) :global(:focus-visible) {
		outline: 2px solid var(--glass-focus);
		outline-offset: 4px;
	}
	a {
		color: var(--accent);
		text-underline-offset: 4px;
	}
	.skip {
		position: absolute;
		inset-inline-start: 16px;
		top: 12px;
		z-index: 1;
		background: var(--page);
		padding: 8px;
	}
	.skip:not(:focus) {
		clip-path: inset(100%);
	}
	.bar,
	main {
		width: min(calc(100% - clamp(32px, 8vw, 128px)), 1320px);
		margin-inline: auto;
	}
	.bar {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		gap: 6px 20px;
		min-height: 64px;
		border-bottom: 1px solid var(--line);
	}
	.bar nav {
		display: flex;
		gap: clamp(12px, 3vw, 32px);
		font-size: 0.88rem;
	}
	.bar a {
		text-decoration: none;
		color: var(--ink);
	}
	.bar nav a,
	.contents a,
	.playground-link {
		position: relative;
		justify-self: start;
		width: fit-content;
	}
	.bar nav a::after,
	.contents a::after,
	.playground-link::after {
		content: '';
		position: absolute;
		inset: auto 0 -3px;
		block-size: 1px;
		background: currentColor;
		opacity: 0;
		transition: opacity var(--glass-motion) ease;
	}
	.bar nav a:focus-visible::after,
	.contents a:focus-visible::after,
	.playground-link:focus-visible::after {
		opacity: 1;
	}
	.brand {
		display: inline-flex;
		align-items: center;
	}
	.brand img {
		display: block;
	}
	.hero {
		display: grid;
		grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
		align-items: center;
		gap: clamp(24px, 5vw, 76px);
		padding-block: clamp(24px, 5vw, 68px) clamp(26px, 4vw, 56px);
	}
	h1,
	h2,
	h3,
	p {
		margin: 0;
	}
	h1,
	h2 {
		font-size: clamp(2rem, 4vw, 3.4rem);
		font-weight: 680;
		line-height: 1.04;
		letter-spacing: -0.055em;
	}
	h1 {
		font-size: clamp(2.75rem, 0.25rem + 5.1vw, 6.25rem);
	}
	p {
		max-width: 70ch;
		color: var(--muted);
	}
	.lead {
		font-size: clamp(1rem, 1.65vw, 1.17rem);
		max-width: 38ch;
		margin-top: 18px;
	}
	.hero-links {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 10px 18px;
		margin-top: 22px;
		font-size: 0.9rem;
	}
	.primary-link {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		padding-inline: 15px;
		border-radius: 999px;
		background: #24563e;
		color: #fff;
		text-decoration: none;
		font-weight: 650;
		position: relative;
		isolation: isolate;
	}
	.primary-link::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;
		border-radius: inherit;
		background: #183e2c;
		opacity: 0;
		transition: opacity var(--glass-motion) ease;
	}
	.primary-link:active::before {
		opacity: 1;
	}
	.playground-link {
		display: inline-flex;
		align-items: center;
		min-block-size: 44px;
		text-decoration: none;
		font-weight: 650;
	}
	.playground-link::after {
		inset-block-end: 8px;
		opacity: 0.45;
	}
	@media (hover: hover) and (pointer: fine) {
		.bar nav a:hover::after,
		.contents a:hover::after,
		.playground-link:hover::after,
		.primary-link:hover::before {
			opacity: 1;
		}
	}
	@media (prefers-reduced-motion: no-preference) {
		.primary-link {
			transition: scale var(--glass-motion) var(--docs-ease-out);
		}
		.primary-link:active {
			scale: 0.97;
		}
	}
	.layout {
		display: grid;
		grid-template-columns: minmax(120px, 0.35fr) minmax(0, 1fr);
		gap: clamp(20px, 5vw, 88px);
		padding-block: 30px 68px;
		border-top: 1px solid var(--line);
	}
	.contents {
		display: grid;
		gap: 8px;
		align-self: start;
		position: sticky;
		top: 24px;
	}
	.contents p {
		color: var(--ink);
		font-weight: 650;
	}
	.contents a {
		text-decoration: none;
		font-size: 0.9rem;
	}
	.reference-body {
		max-width: 850px;
	}
	.reference-body section + section {
		margin-top: 42px;
		padding-top: 25px;
		border-top: 1px solid var(--line);
	}
	h2 {
		margin-bottom: 12px;
	}
	h3 {
		margin-bottom: 5px;
	}
	code {
		font:
			0.83rem/1.65 ui-monospace,
			monospace;
		color: var(--accent);
	}

	#installation h3 {
		margin-top: 20px;
	}
	:global(.docs .example) {
		padding: 14px;
		background: #2c5137;
		border-radius: var(--glass-radius, 24px);
	}
	:global(.docs .example .docs-example) {
		position: relative;
		--glass-radius: 10px;
		--glass-panel-padding: 12px;
		--glass-embedded-tint: #f6faf0d9;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}
	@media (forced-colors: none) and (not (prefers-reduced-transparency: reduce)) {
		:global(.docs .example .docs-example) {
			color: #fff;
		}
		:global(.docs .example .glass-button) {
			color: var(--ink);
		}
	}
	.reference article {
		padding-block: 13px;
		border-bottom: 1px solid var(--line);
	}
	.reference article:last-child {
		border: 0;
	}
	.reference article p {
		margin-bottom: 4px;
	}
	.table-wrap {
		margin-top: 14px;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.9rem;
	}
	th,
	td {
		text-align: start;
		padding: 6px 9px 6px 0;
		border-bottom: 1px solid var(--line);
		overflow-wrap: anywhere;
	}
	ul {
		padding-inline-start: 1.2rem;
		color: var(--muted);
	}
	li + li {
		margin-top: 7px;
	}
	@media (max-width: 800px) {
		.hero,
		.layout {
			grid-template-columns: minmax(0, 1fr);
		}
		.contents {
			position: static;
			display: flex;
			flex-wrap: wrap;
			gap: 5px 15px;
		}
		.contents p {
			flex-basis: 100%;
		}
	}
</style>
