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
		{ value: 'spacious', label: 'Spacious', disabled: true }
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
	let strength = $state(4);
	let enabled = $state(true);
	let displayName = $state('Glassform');
	let description = $state('');
	let announcements = $state(false);
	let saved = $state(false);
</script>

<div class="everyday">
	<h3>Everyday UI</h3>
	<p>Bind a control’s value in Svelte and use native labels, validation, and form submission.</p>
	<GlassProvider class="everyday-preview" {appearance} {solid} blur={strength}>
		<LensStage
			class="everyday-stage"
			refract={enabled && !solid}
			blur={strength}
			photo={{
				src: '/images/leaf-after-rain-720.webp',
				srcset: '/images/leaf-after-rain-720.webp 720w, /images/leaf-after-rain-1440.webp 1440w',
				sizes: '960px',
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
					<div class="profile">
						<GlassAvatar src={logo} alt="Glassform mark" />
						<h4 id={`${id}-heading`}>Display preferences</h4>
					</div>
					<div class="fields">
						<div class="field">
							<label for={`${id}-name`}>Display name (required)</label>
							<GlassInput id={`${id}-name`} name="displayName" bind:value={displayName} required />
						</div>
						<div class="field">
							<label for={`${id}-appearance`}>Appearance</label>
							<GlassSelect
								id={`${id}-appearance`}
								name="appearance"
								options={appearances}
								bind:value={appearance}
							/>
						</div>
						<div class="field full">
							<label for={`${id}-description`}>Description</label>
							<GlassTextarea
								id={`${id}-description`}
								name="description"
								rows={3}
								bind:value={description}
							/>
						</div>
						<GlassRadioGroup
							name="density"
							label="Density"
							options={densityOptions}
							bind:value={density}
						/>
						<GlassSegmentedControl
							name="layout"
							label="Layout"
							options={layouts}
							bind:value={layout}
						/>
						<div class="field full">
							<label for={`${id}-strength`}>Blur <span>{strength} px</span></label>
							<GlassSlider
								id={`${id}-strength`}
								name="strength"
								min={0}
								max={32}
								bind:value={strength}
							/>
						</div>
					</div>
					<div class="toggles">
						<div>
							<GlassCheckbox
								id={`${id}-announcements`}
								name="announcements"
								bind:checked={announcements}
							/><label for={`${id}-announcements`}>Show announcements</label>
						</div>
						<div>
							<GlassSwitch id={`${id}-enabled`} name="effects" bind:checked={enabled} /><label
								for={`${id}-enabled`}
							>
								Refraction
							</label>
						</div>
						<div>
							<GlassSwitch id={`${id}-solid`} name="solid" bind:checked={solid} /><label
								for={`${id}-solid`}
							>
								Solid appearance
							</label>
						</div>
					</div>
					<div class="field">
						<p>
							Focus the list and use <GlassKbd>↑</GlassKbd> or <GlassKbd>↓</GlassKbd> to scroll.
						</p>
						<GlassScrollArea label="Surface components" style="--glass-scroll-max-block-size: 7rem">
							<ul role="list" class:grid={layout === 'grid'}>
								{#each surfaces as surface (surface)}<li>{surface}</li>{/each}
							</ul>
						</GlassScrollArea>
					</div>
					<div class="actions">
						<GlassButton material="embedded" type="submit">Save preferences</GlassButton>
						<span role="status">{saved ? 'Preferences saved for this preview.' : ''}</span>
					</div>
				</form>
			</GlassPanel>
		</LensStage>
	</GlassProvider>
</div>

<style>
	.everyday {
		margin-block-start: 1.5rem;
	}
	.everyday :global(.everyday-stage) {
		--everyday-frame: calc(var(--glass-radius, 24px) + 8px);
		padding: clamp(12px, 4vw, 36px);
		border-radius: var(--everyday-frame);
		background: #263b2c;
	}
	.everyday :global(.everyday-panel) {
		--glass-panel-padding: clamp(14px, 3vw, 26px);
	}
	@media (forced-colors: none) and (not (prefers-reduced-transparency: reduce)) {
		.everyday :global(.everyday-panel[data-material='lens']) {
			--glass-tint: #071a1366;
			--glass-embedded-tint: #273f33dc;
			--glass-focus: #c3efcb;
			color: #f5fbf4;
			color-scheme: dark;
		}
		.everyday :global(.everyday-preview[data-glass-appearance='dark'] .everyday-panel[data-material='lens']) {
			--glass-tint: #071a1390;
		}
	}

	h3,
	h4,
	p {
		margin: 0;
	}
	.everyday > p {
		margin-block: 0.25rem 1rem;
		color: var(--muted);
	}
	form,
	.fields,
	.field {
		display: grid;
		gap: 0.875rem;
	}
	form {
		gap: 1.125rem;
	}
	.fields {
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
	}
	.field {
		gap: 0.375rem;
	}
	.full {
		grid-column: 1 / -1;
	}
	.profile,
	.actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.625rem;
	}
	.profile {
		padding-block-end: 0.75rem;
		border-block-end: 1px solid light-dark(#24463359, #e0f7e263);
	}
	.profile h4 {
		font-size: 1.15rem;
		letter-spacing: -0.025em;
	}
	.field label {
		display: flex;
		justify-content: space-between;
		gap: 0.5rem;
		font-weight: 650;
	}
	.toggles {
		display: flex;
		flex-wrap: wrap;
		column-gap: 1rem;
	}
	.toggles div {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.toggles label {
		display: flex;
		align-items: center;
		min-block-size: 3rem;
		cursor: pointer;
	}
	ul {
		margin: 0;
		padding: 0.5rem 1rem 0.5rem 2rem;
	}
	ul.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 8rem), 1fr));
		gap: 0.375rem;
		padding: 0.5rem;
		list-style: none;
	}
	ul.grid li {
		padding: 0.375rem 0.625rem;
		border: 1px solid currentColor;
		border-radius: 0.375rem;
	}
</style>
