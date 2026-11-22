import { getContext, setContext } from 'svelte';

export type GlassMaterial = 'solid' | 'lens';
export type GlassAppearance = 'system' | 'light' | 'dark';

const materialKey = Symbol('glassform.material');

export function provideSolidPreference(isSolid: () => boolean) {
	setContext(materialKey, isSolid);
}

export function getSolidPreference() {
	return getContext<(() => boolean) | undefined>(materialKey);
}
