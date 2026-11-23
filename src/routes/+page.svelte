<script lang="ts">
	import { resolve } from '$app/paths';
	import logo from '#lib/assets/glassform-mark.png';
	import { onMount } from 'svelte';
	import { GlassButton, GlassPanel, GlassProvider, LensStage } from '#lib';
	import MaterialDemo from './docs/MaterialDemo.svelte';
	import CodeBlock from './docs/CodeBlock.svelte';
	import EverydayDemo from './docs/EverydayDemo.svelte';
	import { photoOverscan } from '../lib/glass/backdrop-lens';
	import { defaultLensBlur } from '../lib/glass/lens-profile';

	let applied = $state({ blur: false, refraction: false });
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

	const comparisonPhoto = {
		src: '/images/leaf-after-rain-720.webp',
		width: 720,
		height: 960,
		loading: 'lazy'
	} as const;

	const componentGroups = [
		{
			name: 'Core',
			rows: [
				{
					name: 'GlassProvider',
					description:
						'Scopes appearance, blur, and Solid mode. Nested providers inherit settings they omit.',
					api: 'appearance: system | light | dark · blur: number (px) · solid: boolean · as: div | main | section',
					demo: 'compose-panel'
				},
				{
					name: 'LensStage',
					description:
						'Supplies a photo backdrop and automatically applies optical refraction to Lens surfaces inside it.',
					api: 'photo: { src, srcset?, sizes?, alt? } · blur: number (px) · ripple: number · refract: boolean · trackPointer: boolean',
					demo: 'lens'
				}
			]
		},
		{
			name: 'Surfaces',
			rows: [
				{
					name: 'GlassSurface',
					description: 'The base surface with a shared rim and corner radius. Defaults to Lens.',
					api: 'material: lens | solid',
					demo: 'lens'
				},
				{
					name: 'GlassPanel',
					description:
						'A padded GlassSurface for grouping content and controls. Accepts the same props as GlassSurface.',
					api: 'material: lens | solid · --glass-panel-padding',
					demo: 'compose-panel'
				},
				{ name: 'GlassAvatar', api: 'src, alt, fallback initials', demo: 'everyday-ui' },
				{ name: 'GlassKbd', api: 'Keyboard shortcut content', demo: 'everyday-ui' },
				{
					name: 'GlassScrollArea',
					api: 'label, --glass-scroll-max-block-size',
					demo: 'everyday-ui'
				}
			]
		},
		{
			name: 'Controls',
			rows: [
				{
					name: 'GlassButton',
					description:
						'A native button that defaults to type="button" and the Solid material. Use embedded inside a Panel to share its blur.',
					api: 'material: solid | lens | embedded · native button attributes and events',
					demo: 'compose-panel'
				},
				{ name: 'GlassInput', api: 'Native input attributes, bind:value', demo: 'everyday-ui' },
				{
					name: 'GlassTextarea',
					api: 'Native textarea attributes, bind:value',
					demo: 'everyday-ui'
				},
				{ name: 'GlassSelect', api: 'options, bind:value', demo: 'everyday-ui' },
				{
					name: 'GlassCheckbox',
					api: 'Native checkbox attributes, bind:checked',
					demo: 'everyday-ui'
				},
				{
					name: 'GlassSwitch',
					api: 'Native checkbox attributes, bind:checked',
					demo: 'everyday-ui'
				},
				{ name: 'GlassSlider', api: 'min, max, step, bind:value', demo: 'everyday-ui' },
				{ name: 'GlassRadioGroup', api: 'label, name, options, bind:value', demo: 'everyday-ui' },
				{
					name: 'GlassSegmentedControl',
					api: 'label, name, options, bind:value',
					demo: 'everyday-ui'
				}
			]
		}
	] satisfies {
		name: string;
		rows: { name: string; api: string; demo: string; description?: string }[];
	}[];

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
		content="Build with Glassform's Svelte and React components, compare glass materials on real photography, and learn how Lens refraction works."
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
					Glassform ships Svelte and React components with shared glass styles and photo-backed
					refraction.
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
					<div class="paired">
						<section aria-labelledby="svelte">
							<h3 id="svelte">Svelte</h3>
							<p>Run in a project configured for shadcn-svelte. Its installer requires Tailwind.</p>
							<CodeBlock wrap label="Svelte terminal" code={installCommand} />
							<a href={resolve('/r/glassform.json')}>Svelte registry item</a>
						</section>
						<section aria-labelledby="react">
							<h3 id="react">React</h3>
							<p>Run in a project configured for shadcn.</p>
							<CodeBlock wrap label="React terminal" code={reactInstallCommand} />
							<a href={resolve('/r/glassform-react.json')}>React registry item</a>
						</section>
					</div>
					<p>
						Both commands copy the source into the <code>glassform</code> folder under your components
						alias. Glassform uses plain CSS. For a manual install, copy the files from the registry item.
					</p>
					<h3 id="compose-panel">Compose a panel</h3>
					<p>
						These examples put a panel inside a <code>LensStage</code>. Set <code>photo.src</code>
						to your backdrop image.
						<a href="#lens">Compare both lens modes</a>.
					</p>
					<CodeBlock label="DisplaySettings.svelte" code={example} />
					<CodeBlock label="SettingsPanel.tsx" code={reactExample} />
				</section>

				<section id="components">
					<h2>Components</h2>
					{#each componentGroups as group (group.name)}
						<h3 id={`components-${group.name.toLowerCase()}`}>{group.name}</h3>
						<table
							class="component-table"
							aria-labelledby={`components-${group.name.toLowerCase()}`}
						>
							<thead>
								<tr><th scope="col">Component</th><th scope="col">Props and usage</th></tr>
							</thead>
							<tbody>
								{#each group.rows as row (row.name)}
									<tr>
										<th scope="row"><a href={`#${row.demo}`}><code>{row.name}</code></a></th>
										<td>
											{#if 'description' in row}<p>{row.description}</p>{/if}
											<code>{row.api}</code>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					{/each}
					<EverydayDemo />
					<p>
						Use an <code>id</code> with a matching <code>&lt;label for&gt;</code> on individual controls.
						Groups render their own legend. Share refraction by placing related controls in one Lens panel.
					</p>
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
					{#snippet settingsPanel(mode: 'blur' | 'refraction')}
						<GlassPanel class="docs-example" material="lens">
							<strong>Display settings</strong>
							<GlassButton material="embedded" onclick={() => (applied[mode] = true)}>
								{applied[mode] ? 'Applied' : 'Apply'}
							</GlassButton>
						</GlassPanel>
					{/snippet}
					<div class="paired">
						<section>
							<h3>Live backdrop blur</h3>
							<div class="example blur-example">
								<img {...comparisonPhoto} alt="" style:--photo-scale={photoOverscan} />
								{@render settingsPanel('blur')}
							</div>
							<p>
								Use <code>GlassSurface</code> or <code>GlassPanel</code> with
								<code>material="lens"</code> to blur the page content behind it.
							</p>
						</section>
						<section>
							<h3>Image-backed refraction</h3>
							<LensStage class="example" photo={comparisonPhoto}>
								{@render settingsPanel('refraction')}
							</LensStage>
							<p>
								Supply a photo to <code>LensStage</code> to bend the image through the Lens surfaces it
								discovers inside.
							</p>
						</section>
					</div>
					<ul>
						<li>
							<strong>WebGL</strong> bends the backdrop with a displacement map. Set
							<code>trackPointer</code>
							to enable pointer-driven highlights, or <code>refract=&#123;false&#125;</code> for a frosted
							finish.
						</li>
						<li>
							<strong>Fallbacks</strong> use SVG displacement where supported, or CSS backdrop blur when
							an optical renderer is unavailable.
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
		--spacing-2: 0.5rem;
		--spacing-3: 0.75rem;
		--spacing-4: 1rem;
		--spacing-6: 1.5rem;
		--type-section: clamp(1.75rem, 1.25rem + 1.25vw, 2.375rem);
		--type-subsection: 1.125rem;
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
		max-width: 60rem;
	}
	.reference-body section + section {
		margin-top: 42px;
		padding-top: 25px;
		border-top: 1px solid var(--line);
	}
	h2 {
		font-size: var(--type-section);
		margin-block-end: var(--spacing-4);
	}
	h3 {
		font-size: var(--type-subsection);
		font-weight: 650;
		line-height: 1.35;
		margin-block-end: var(--spacing-2);
	}
	code {
		font:
			0.83rem/1.65 ui-monospace,
			monospace;
		color: var(--accent);
	}

	.paired {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 19rem), 1fr));
		gap: var(--spacing-6);
		margin-block-end: var(--spacing-4);
	}
	.paired section {
		display: flex;
		flex-direction: column;
		min-inline-size: 0;
	}
	.paired section + section {
		margin: 0;
		padding: 0;
		border: 0;
	}
	.paired section a {
		align-self: flex-start;
	}
	.paired section :global(.code-block) {
		margin-block-start: auto;
	}
	#installation .paired section > p {
		margin-block-end: var(--spacing-3);
	}
	#compose-panel,
	#components h3 {
		margin-block-start: var(--spacing-6);
	}
	.reference-body :is(section, h3)[id] {
		scroll-margin-block-start: var(--spacing-6);
	}
	:global(.docs .example) {
		padding: var(--spacing-4);
		aspect-ratio: 2 / 1;
		align-content: center;
		background: #2c5137;
		border-radius: var(--glass-radius, 1.5rem);
		outline: 1px solid var(--outline-image);
		outline-offset: -1px;
		margin-block-end: var(--spacing-2);
	}
	.blur-example {
		position: relative;
		display: grid;
		overflow: clip;
		isolation: isolate;
	}
	.blur-example img {
		position: absolute;
		inset: 0;
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
		transform: scale(var(--photo-scale));
	}
	:global(.docs .example .docs-example) {
		position: relative;
		--glass-radius: calc(1.5rem - var(--spacing-4));
		--glass-panel-padding: var(--spacing-3);
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
	.component-table {
		table-layout: fixed;
	}
	.component-table th:first-child {
		inline-size: 35%;
	}
	.component-table p {
		margin-block-end: 0.25rem;
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
			gap: var(--spacing-2) var(--spacing-4);
		}
		.contents p {
			flex-basis: 100%;
		}
	}
</style>
