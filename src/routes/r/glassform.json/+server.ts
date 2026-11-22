import { json } from '@sveltejs/kit';
import provider from '../../../lib/glass/GlassProvider.svelte?raw';
import surface from '../../../lib/glass/GlassSurface.svelte?raw';
import panel from '../../../lib/glass/GlassPanel.svelte?raw';
import button from '../../../lib/glass/GlassButton.svelte?raw';
import material from '../../../lib/glass/material.ts?raw';
import styles from '../../../lib/glass/glass.css?raw';
import lensStage from '../../../lib/glass/LensStage.svelte?raw';
import backdropLens from '../../../lib/glass/BackdropLens.svelte?raw';
import lensRenderer from '../../../lib/glass/backdrop-lens.ts?raw';
import { defaultLensBlur, lensDisplacementMap } from '../../../lib/glass/lens-profile';
import everydayAvatar from '../../../lib/glass/GlassAvatar.svelte?raw';
import everydayKbd from '../../../lib/glass/GlassKbd.svelte?raw';
import everydayScrollArea from '../../../lib/glass/GlassScrollArea.svelte?raw';
import everydayInput from '../../../lib/glass/GlassInput.svelte?raw';
import everydayCheckbox from '../../../lib/glass/GlassCheckbox.svelte?raw';
import everydayRadioGroup from '../../../lib/glass/GlassRadioGroup.svelte?raw';
import everydayTextarea from '../../../lib/glass/GlassTextarea.svelte?raw';
import everydaySelect from '../../../lib/glass/GlassSelect.svelte?raw';
import everydaySwitch from '../../../lib/glass/GlassSwitch.svelte?raw';
import everydaySlider from '../../../lib/glass/GlassSlider.svelte?raw';
import everydaySegmentedControl from '../../../lib/glass/GlassSegmentedControl.svelte?raw';
import options from '../../../lib/glass/options.ts?raw';

export const prerender = true;

export function GET() {
	const sources = {
		'GlassProvider.svelte': provider,
		'GlassSurface.svelte': surface,
		'GlassPanel.svelte': panel,
		'GlassButton.svelte': button,
		'material.ts': material,
		'glass.css': styles,
		'LensStage.svelte': lensStage,
		'BackdropLens.svelte': backdropLens,
		'backdrop-lens.ts': lensRenderer,
		'GlassAvatar.svelte': everydayAvatar,
		'GlassKbd.svelte': everydayKbd,
		'GlassScrollArea.svelte': everydayScrollArea,
		'GlassInput.svelte': everydayInput,
		'GlassCheckbox.svelte': everydayCheckbox,
		'GlassRadioGroup.svelte': everydayRadioGroup,
		'GlassTextarea.svelte': everydayTextarea,
		'GlassSelect.svelte': everydaySelect,
		'GlassSwitch.svelte': everydaySwitch,
		'GlassSlider.svelte': everydaySlider,
		'GlassSegmentedControl.svelte': everydaySegmentedControl,
		'options.ts': options,
		'lens-profile.ts': `export const defaultLensBlur = ${defaultLensBlur};\nexport const lensDisplacementMap = ${JSON.stringify(lensDisplacementMap)};\n`
	};

	return json({
		$schema: 'https://www.shadcn-svelte.com/schema/registry-item.json',
		name: 'glassform',
		type: 'registry:block',
		title: 'Glassform',
		description: 'Svelte 5 glass surfaces, controls, and photo-backed LensStage refraction.',
		files: Object.entries(sources).map(([name, content]) => ({
			type: 'registry:file',
			target: 'glassform/' + name,
			content
		}))
	});
}
