import { json } from '@sveltejs/kit';
import components from '../../../lib/glass/glassform.tsx?raw';
import lensStage from '../../../lib/glass/lens-stage.tsx?raw';
import styles from '../../../lib/glass/glass.css?raw';
import stageStyles from '../../../lib/glass/react-stage.css?raw';
import renderer from '../../../lib/glass/backdrop-lens.ts?raw';
import { defaultLensBlur, lensDisplacementMap } from '../../../lib/glass/lens-profile';

export const prerender = true;

export function GET() {
	const sources = {
		'glassform.tsx': components,
		'lens-stage.tsx': lensStage,
		'glass.css': styles,
		'react-stage.css': stageStyles,
		'backdrop-lens.ts': renderer,
		'lens-profile.ts': `export const defaultLensBlur = ${defaultLensBlur};\nexport const lensDisplacementMap = ${JSON.stringify(lensDisplacementMap)};\n`
	};

	return json({
		$schema: 'https://ui.shadcn.com/schema/registry-item.json',
		name: 'glassform-react',
		type: 'registry:item',
		title: 'Glassform for React',
		description: 'React glass components and photo-backed LensStage refraction.',
		files: Object.entries(sources).map(([name, content]) => ({
			path: 'glassform/' + name,
			type: 'registry:file',
			target: '@components/glassform/' + name,
			content
		}))
	});
}
