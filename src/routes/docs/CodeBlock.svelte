<script lang="ts">
	import { onMount } from 'svelte';
	import { GlassButton, GlassSurface } from '#lib';

	let { label, code }: { label: string; code: string } = $props();
	const codeId = $props.id();
	let codeElement: HTMLElement;
	let status = $state('');
	let lastStatus = '';
	let timer: ReturnType<typeof setTimeout>;

	async function copy() {
		let message = 'Copied';
		try {
			await navigator.clipboard.writeText(code);
		} catch {
			message = 'Copy failed';
		}
		clearTimeout(timer);
		status = message === lastStatus ? message + '\u00a0' : message;
		lastStatus = status;
		timer = setTimeout(() => (status = ''), 2300);
	}

	onMount(() => {
		const element = codeElement;
		const handleCommand = () => {
			void copy();
		};
		element.addEventListener('command', handleCommand);
		return () => {
			element.removeEventListener('command', handleCommand);
			clearTimeout(timer);
		};
	});
</script>

<GlassSurface class="code-block" material="solid" style="color-scheme: dark">
	<div class="toolbar">
		<span class="label" id={codeId + '-label'}>{label}</span>
		<span class="actions">
			<span class="copy-status" class:visible={Boolean(status)} role="status">{status}</span>
			<GlassButton
				material="embedded"
				command="--copy"
				commandfor={codeId}
				aria-describedby={codeId + '-label'}
				onclick={() => {
					if (!('CommandEvent' in window)) void copy();
				}}
			>
				Copy
			</GlassButton>
		</span>
	</div>
	<!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard access to horizontally scrolling code) -->
	<pre role="region" aria-label={label} tabindex="0"><code id={codeId} bind:this={codeElement}
			>{code}</code
		></pre>
</GlassSurface>

<style>
	:global(.code-block.glass-surface) {
		background: #1a2520;
		color: #e8f0e7;
		--glass-radius: 13px;
		--glass-rim: #43574a;
		--glass-rim-highlight: #ffffff14;
		--glass-focus: #d7f9e3;
		margin-block: 14px 18px;
		box-shadow: none;
		min-inline-size: 0;
	}
	.toolbar {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		gap: 6px 12px;
		padding: 7px 12px;
		border-bottom: 1px solid var(--glass-rim);
	}
	.label {
		font:
			0.76rem/1.5 ui-monospace,
			monospace;
		color: #b9cfbd;
	}
	.actions {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 0.78rem;
	}
	.copy-status {
		opacity: 0;
		transition: opacity var(--glass-motion, 150ms) ease;
	}
	.copy-status.visible {
		opacity: 1;
	}
	.actions :global(button) {
		min-block-size: 32px;
		padding: 3px 10px;
		--glass-rim: #819689;
		--glass-button-radius: 6px;
	}
	pre {
		margin: 0;
		padding: 14px;
		overflow: auto;
		font:
			0.83rem/1.65 ui-monospace,
			monospace;
	}
	pre:focus-visible {
		outline: 2px solid var(--glass-focus);
		outline-offset: -4px;
	}
	code {
		font: inherit;
	}
</style>
