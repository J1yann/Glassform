<script lang="ts">
	import {
		GlassAvatar,
		GlassButton,
		GlassCheckbox,
		GlassInput,
		GlassKbd,
		GlassPanel,
		GlassProvider,
		GlassRadioGroup,
		GlassScrollArea,
		GlassSegmentedControl,
		GlassSelect,
		GlassSlider,
		GlassSwitch,
		GlassTextarea,
		LensStage,
		type GlassAppearance
	} from '#lib';
	import logo from '#lib/assets/glassform-mark.png';

	const id = $props.id();
	const appearances = [
		{ value: 'system', label: 'System' },
		{ value: 'light', label: 'Light' },
		{ value: 'dark', label: 'Dark' }
	];
	const densityOptions = [
		{ value: 'compact', label: 'Compact' },
		{ value: 'comfortable', label: 'Comfortable' },
		{ value: 'spacious', label: 'Spacious' }
	];
	const layouts = [
		{ value: 'list', label: 'List' },
		{ value: 'grid', label: 'Grid' }
	];
	const surfaces = ['Provider', 'Surface', 'Panel', 'Avatar', 'Kbd', 'Scroll Area', 'LensStage'];

	let appearance = $state<GlassAppearance>('light');
	let solid = $state(false);
	let density = $state('comfortable');
	let layout = $state('list');
	let strength = $state(12);
	let enabled = $state(true);
	let displayName = $state('Glassform');
	let description = $state('Liquid glass components for the web.');
	let announcements = $state(false);
	let saved = $state(false);
</script>

<section class="everyday" aria-labelledby="everyday-ui">
	<h3 id="everyday-ui">Everyday UI</h3>
	<p>Change the settings to see how Glassform controls work together on a Lens panel.</p>
	<GlassProvider class="everyday-preview" {appearance} {solid} blur={strength}>
		<LensStage
			class="everyday-stage"
			refract={enabled && !solid}
			blur={strength}
			photo={{
				src: '/images/leaf-after-rain-720.webp',
				srcset: '/images/leaf-after-rain-720.webp 720w, /images/leaf-after-rain-1440.webp 1440w',
				sizes: '(max-width: 60rem) 100vw, 60rem',
				width: 720,
				height: 960,
				loading: 'lazy'
			}}
		>
			<GlassPanel class="everyday-panel">
				<form
					aria-labelledby={`${id}-heading`}
					oninput={() => (saved = false)}
					onchange={() => (saved = false)}
					onsubmit={(event) => {
						event.preventDefault();
						saved = true;
					}}
				>
					<h4 id={`${id}-heading`}>Workspace settings</h4>
					<div class="workspace">
						<div class="settings">
							<fieldset class="group">
								<legend>Profile</legend>
								<div class="field">
									<label for={`${id}-name`}>Display name (required)</label>
									<GlassInput
										id={`${id}-name`}
										name="displayName"
										bind:value={displayName}
										required
									/>
								</div>
								<div class="field">
									<label for={`${id}-description`}>Description</label>
									<GlassTextarea
										id={`${id}-description`}
										name="description"
										rows={2}
										bind:value={description}
									/>
								</div>
							</fieldset>

							<fieldset class="group">
								<legend>Appearance</legend>
								<div class="field">
									<label for={`${id}-appearance`}>Color scheme</label>
									<GlassSelect
										id={`${id}-appearance`}
										name="appearance"
										options={appearances}
										bind:value={appearance}
									/>
								</div>
								<div class="field">
									<label for={`${id}-strength`}>Backdrop blur</label>
									<output for={`${id}-strength`}>{strength} px</output>
									<GlassSlider
										id={`${id}-strength`}
										name="strength"
										min={0}
										max={32}
										bind:value={strength}
										disabled={solid}
									/>
								</div>
								<div class="toggle">
									<GlassSwitch
										id={`${id}-enabled`}
										name="effects"
										bind:checked={enabled}
										disabled={solid}
									/>
									<label for={`${id}-enabled`}>Refraction</label>
								</div>
								<div class="toggle">
									<GlassSwitch id={`${id}-solid`} name="solid" bind:checked={solid} />
									<label for={`${id}-solid`}>Solid surfaces</label>
								</div>
							</fieldset>
						</div>

						<section class="preview" aria-labelledby={`${id}-preview`}>
							<h5 id={`${id}-preview`}>Live preview</h5>
							<header class="profile">
								<GlassAvatar src={logo} alt="" />
								<div>
									<strong>{displayName.trim() || 'Workspace'}</strong>
									{#if description.trim()}<p>{description}</p>{/if}
								</div>
							</header>
							<div class="preview-controls">
								<GlassSegmentedControl
									name="layout"
									label="Layout"
									options={layouts}
									bind:value={layout}
								/>
								<GlassRadioGroup
									name="density"
									label="Density"
									options={densityOptions}
									bind:value={density}
								/>
								<div class="toggle">
									<GlassCheckbox
										id={`${id}-announcements`}
										name="announcements"
										bind:checked={announcements}
									/>
									<label for={`${id}-announcements`}>Show announcements</label>
								</div>
							</div>
							{#if announcements}<p class="announcement">Glassform for React is available.</p>{/if}
							<div class="collection">
								<p>Surface components</p>
								<GlassScrollArea
									label="Surface components"
									style="--glass-scroll-max-block-size: 9rem"
								>
									<ul role="list" class:grid={layout === 'grid'} data-density={density}>
										{#each surfaces as surface (surface)}<li>{surface}</li>{/each}
									</ul>
								</GlassScrollArea>
								<p class="scroll-hint">
									Focus the collection to scroll with <GlassKbd>↑</GlassKbd> and <GlassKbd>
										↓
									</GlassKbd>.
								</p>
							</div>
						</section>
					</div>
					<footer class="actions">
						<GlassButton material="embedded" type="submit">Save preferences</GlassButton>
						<span role="status">{saved ? 'Preferences saved for this preview.' : ''}</span>
					</footer>
				</form>
			</GlassPanel>
		</LensStage>
	</GlassProvider>
</section>

<style>
	.everyday {
		margin-block-start: var(--spacing-6);
	}
	.everyday :global(.everyday-stage) {
		--stage-inset: clamp(var(--spacing-3), 3vw, var(--spacing-6));
		padding: var(--stage-inset);
		border-radius: calc(var(--glass-radius, 1.5rem) + var(--stage-inset));
		background: #263b2c;
		outline: 1px solid var(--outline-image);
		outline-offset: -1px;
	}
	.everyday :global(.everyday-panel) {
		--glass-panel-padding: clamp(var(--spacing-4), 3vw, var(--spacing-6));
		--settings-line: light-dark(#24463359, #e0f7e263);
		--preview-fill: light-dark(#ffffff55, #0d241b59);
	}
	@media (forced-colors: none) and (not (prefers-reduced-transparency: reduce)) {
		.everyday :global(.everyday-panel[data-material='lens']) {
			--glass-tint: #0d291db3;
			--glass-embedded-tint: #183c2cdd;
			--glass-focus: #c3efcb;
			color: #f5fbf4;
			color-scheme: dark;
		}
		.everyday
			:global(
				.everyday-preview[data-glass-appearance='dark'] .everyday-panel[data-material='lens']
			) {
			--glass-tint: #071a13d9;
		}
	}

	h3,
	h4,
	h5,
	p {
		margin: 0;
	}
	.everyday > p {
		margin-block: 0.25rem var(--spacing-4);
		color: var(--muted);
	}
	form,
	.workspace,
	.settings,
	.group,
	.field,
	.preview,
	.preview-controls,
	.collection {
		display: grid;
		gap: var(--spacing-4);
		min-inline-size: 0;
	}
	form {
		gap: var(--spacing-6);
	}
	h4 {
		font-size: clamp(1.25rem, 1.1rem + 0.5vw, 1.625rem);
		line-height: 1.2;
		letter-spacing: -0.025em;
	}
	.workspace {
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 19rem), 1fr));
		align-items: start;
		gap: var(--spacing-6);
	}
	.group {
		margin: 0;
		padding: 0;
		border: 0;
	}
	.group > legend,
	h5 {
		padding: 0;
		font-size: 1.0625rem;
		font-weight: 700;
	}
	.group > legend {
		margin-block-end: var(--spacing-2);
	}
	.group + .group {
		border-block-start: 1px solid var(--settings-line);
		padding-block-start: var(--spacing-3);
	}
	.group + .group > legend {
		padding-inline-end: var(--spacing-2);
		margin-block-end: 0;
	}
	.field,
	.collection {
		gap: 0.375rem;
	}
	.field {
		grid-template-columns: minmax(0, 1fr) auto;
	}
	.field label {
		grid-column: 1 / -1;
		font-weight: 650;
	}
	.field:has(output) label {
		grid-column: 1;
	}
	.field output {
		justify-self: end;
		font-variant-numeric: tabular-nums;
	}
	.field :global(input),
	.field :global(textarea),
	.field :global(select) {
		grid-column: 1 / -1;
		min-inline-size: 0;
		font-size: max(1rem, 1em);
	}
	.toggle,
	.profile,
	.actions {
		display: flex;
		align-items: center;
		gap: var(--spacing-2);
	}
	.toggle label {
		display: flex;
		align-items: center;
		min-block-size: 2rem;
		cursor: pointer;
	}
	.toggle:has(:disabled) label {
		cursor: default;
	}
	.preview {
		padding: var(--spacing-4);
		border: 1px solid var(--settings-line);
		border-radius: calc(var(--glass-radius, 1.5rem) - var(--spacing-3));
		background: var(--preview-fill);
	}
	.profile {
		gap: var(--spacing-3);
		padding-block-end: var(--spacing-3);
		border-block-end: 1px solid var(--settings-line);
		overflow-wrap: anywhere;
	}
	.profile p {
		white-space: pre-wrap;
	}
	.preview-controls {
		gap: var(--spacing-2);
	}
	.announcement {
		padding-inline-start: var(--spacing-2);
		border-inline-start: 2px solid currentColor;
	}
	.collection > p:first-child {
		font-weight: 650;
	}
	.scroll-hint,
	.actions span {
		font-size: 0.875rem;
	}
	ul {
		--row-inset: 0.5rem;
		margin: 0;
		padding: var(--spacing-2);
		list-style: none;
	}
	ul[data-density='compact'] {
		--row-inset: 0.25rem;
	}
	ul[data-density='spacious'] {
		--row-inset: 0.75rem;
	}
	li {
		padding: var(--row-inset) var(--spacing-2);
		overflow-wrap: anywhere;
	}
	ul:not(.grid) li + li {
		border-block-start: 1px solid var(--settings-line);
	}
	ul.grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.375rem;
	}
	ul.grid li {
		border: 1px solid var(--settings-line);
		border-radius: 0.375rem;
	}
	.actions {
		flex-wrap: wrap;
		justify-content: space-between;
		padding-block-start: var(--spacing-4);
		border-block-start: 1px solid var(--settings-line);
	}
	@media (pointer: coarse) {
		.toggle label,
		.field :global(input:not([type='range'])),
		.field :global(select) {
			min-block-size: 3rem;
		}
	}
</style>
