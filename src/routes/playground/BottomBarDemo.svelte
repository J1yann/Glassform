<script lang="ts">
	import { GlassButton, GlassPanel, GlassSurface, type GlassMaterial } from '#lib';
	import type { Snippet } from 'svelte';
	import chromeLogo from '#lib/assets/dock/chrome.png';
	import netflixLogo from '#lib/assets/dock/netflix.png';
	import discordLogo from '#lib/assets/dock/discord.png';

	let { material, children }: { material: GlassMaterial; children: Snippet } = $props();

	const id = $props.id();
	const tabs = ['Home', 'Search', 'Library'] as const;
	const logos = { Home: chromeLogo, Search: netflixLogo, Library: discordLogo };
	const collection = ['Leaf after rain', 'Rain study', 'Prism', 'Checkerboard'];
	let active = $state<(typeof tabs)[number]>('Home');
	let query = $state('');
	let results = $derived(
		collection.filter((item) => item.toLowerCase().includes(query.trim().toLowerCase()))
	);

	let x = $state(0);
	let y = $state(0);
	let dragging = $state(false);
	let gesture = $state<{ id: number; startX: number; startY: number; originX: number; originY: number }>();

	function startDrag(event: PointerEvent) {
		if (!event.isPrimary || event.button !== 0) return;
		if (event.target instanceof Element && event.target.closest('[role="tab"]')) event.preventDefault();
		gesture = {
			id: event.pointerId,
			startX: event.clientX,
			startY: event.clientY,
			originX: x,
			originY: y
		};
		dragging = false;
	}

	function moveDrag(event: PointerEvent & { currentTarget: HTMLElement }) {
		if (gesture?.id !== event.pointerId) return;
		const dx = event.clientX - gesture.startX;
		const dy = event.clientY - gesture.startY;
		if (!dragging && Math.hypot(dx, dy) < 5) return;

		const bar = event.currentTarget;
		const stage = bar.closest('.stage');
		if (!stage) return;
		if (!dragging) {
			dragging = true;
			bar.setPointerCapture(event.pointerId);
		}
		const bounds = stage.getBoundingClientRect();
		const rect = bar.getBoundingClientRect();
		const inset = 4;
		x = Math.min(
			bounds.right - rect.right + x - inset,
			Math.max(bounds.left - rect.left + x + inset, gesture.originX + dx)
		);
		y = Math.min(
			bounds.bottom - rect.bottom + y - inset,
			Math.max(bounds.top - rect.top + y + inset, gesture.originY + dy)
		);
	}

	function finishDrag(event: PointerEvent) {
		if (gesture?.id === event.pointerId) gesture = undefined;
	}

	function moveFocus(event: KeyboardEvent & { currentTarget: HTMLButtonElement }, index: number) {
		const targets: Record<string, number> = {
			ArrowLeft: (index + tabs.length - 1) % tabs.length,
			ArrowRight: (index + 1) % tabs.length,
			Home: 0,
			End: tabs.length - 1
		};
		const next = targets[event.key];
		if (typeof next !== 'number') return;
		event.preventDefault();
		event.currentTarget.parentElement?.querySelectorAll('button')[next]?.focus();
	}
</script>

<div class="preview">
	<GlassPanel class="panels" {material} data-component-lens>
		<div
			id={`${id}-panel-0`}
			role="tabpanel"
			aria-labelledby={`${id}-0`}
			tabindex={active === 'Home' ? 0 : undefined}
			hidden={active !== 'Home'}
		>
			{@render children()}
		</div>
		<div id={`${id}-panel-1`} role="tabpanel" aria-labelledby={`${id}-1`} hidden={active !== 'Search'}>
			<h2>Search</h2>
			<label>
				Find a study
				<input type="search" bind:value={query} />
			</label>
			{#if results.length}
				<ul aria-label="Results">
					{#each results as item (item)}<li>{item}</li>{/each}
				</ul>
			{:else}
				<p>No matching studies.</p>
			{/if}
		</div>
		<div
			id={`${id}-panel-2`}
			role="tabpanel"
			aria-labelledby={`${id}-2`}
			tabindex={active === 'Library' ? 0 : undefined}
			hidden={active !== 'Library'}
		></div>
	</GlassPanel>

	<GlassSurface
		class="bottom-bar"
		data-dragging={dragging && gesture ? '' : undefined}
		style={`transform: translate(${x}px, ${y}px); --active-tab: ${tabs.indexOf(active)}`}
		onpointerdown={startDrag}
		onpointermove={moveDrag}
		onpointerup={finishDrag}
		onpointercancel={finishDrag}
		onlostpointercapture={finishDrag}
		onclickcapture={(event) => {
			if (dragging && event.detail > 0) {
				event.preventDefault();
				event.stopPropagation();
				dragging = false;
			}
		}}
		{material}
		data-component-lens
		role="tablist"
		aria-label="Example navigation"
	>
		<span class="dock-indicator" aria-hidden="true"></span>
		{#each tabs as tab, index (tab)}
			<GlassButton
				id={`${id}-${index}`}
				role="tab"
				aria-label={tab}
				aria-controls={`${id}-panel-${index}`}
				material="embedded"
				aria-selected={active === tab}
				tabindex={active === tab ? 0 : -1}
				onfocus={() => (active = tab)}
				onclick={(event: MouseEvent & { currentTarget: HTMLButtonElement }) => {
					active = tab;
					event.currentTarget.focus();
				}}
				onkeydown={(event: KeyboardEvent & { currentTarget: HTMLButtonElement }) =>
					moveFocus(event, index)}
			>
				<img class="dock-logo" src={logos[tab]} alt="" width="44" height="44" draggable="false" />
			</GlassButton>
		{/each}
	</GlassSurface>
</div>

<style>
	.preview {
		display: grid;
		justify-items: center;
		gap: clamp(16px, 4cqi, 28px);
		position: relative;
		min-inline-size: 0;
	}
	.preview :global(.panels) {
		box-sizing: border-box;
		inline-size: min(100%, 520px);
		min-block-size: 204px;
	}
	h2,
	p {
		margin: 0 0 8px;
	}
	h2 {
		font-size: 1.35rem;
	}
	p,
	label,
	ul {
		font-size: 0.88rem;
	}
	label {
		display: grid;
		gap: 4px;
	}
	input {
		box-sizing: border-box;
		width: 100%;
		min-block-size: 44px;
		padding: 6px 10px;
		border: 1px solid var(--accent);
		border-radius: 8px;
		background: var(--well);
		color: inherit;
		font: inherit;
	}
	ul {
		margin: 8px 0 0;
		padding-inline-start: 18px;
	}
	.preview :global(.bottom-bar) {
		--glass-radius: 26px;
		--glass-button-radius: 18px;
		box-sizing: border-box;
		display: grid;
		--dock-gap: 3px;
		--dock-padding: 7px;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--dock-gap);
		inline-size: min(100%, 196px);
		padding: var(--dock-padding);
		touch-action: none;
		user-select: none;
		cursor: grab;
	}
	.dock-logo {
		display: block;
		object-fit: contain;
	}
	.dock-indicator {
		position: absolute;
		inset-block-end: calc(var(--dock-padding) + 2px);
		inset-inline-start: var(--dock-padding);
		inline-size: calc((100% - 2 * var(--dock-padding) - 2 * var(--dock-gap)) / 3);
		display: grid;
		justify-items: center;
		transform: translateX(calc(var(--active-tab) * (100% + var(--dock-gap))));
		pointer-events: none;
	}
	.dock-indicator::after {
		content: '';
		inline-size: 12px;
		block-size: 2px;
		border-radius: 2px;
		background: var(--ink);
	}
	@media (prefers-reduced-motion: no-preference) {
		.dock-indicator {
			transition: transform 180ms cubic-bezier(0.77, 0, 0.175, 1);
		}
		.dock-logo {
			transition: transform 150ms ease;
		}
	}
	@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
		:global(.bottom-bar:not([data-dragging]) [role='tab']:hover) .dock-logo {
			transform: translateY(-3px) scale(1.12);
		}
	}
	.preview :global(.bottom-bar[data-dragging]),
	.preview :global(.bottom-bar[data-dragging] button) {
		cursor: grabbing;
	}
	.preview :global([role='tab']) {
		min-block-size: 54px;
		color: var(--ink);
		border-color: transparent;
		background: transparent;
		box-shadow: none;
		padding-inline: 4px;
		font-size: 0.85rem;
	}
	.preview :global([role='tab']::before) {
		display: none;
	}
	.preview :global(:focus-visible) {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}
</style>
