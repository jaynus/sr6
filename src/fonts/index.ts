import './all.scss';

function buildDefinition(path: string, style: 'normal' | 'italic' = 'normal', weight: string = '400'): FontDefinition {
	return {
		urls: [`systems/sr6/assets/fonts/${path}`],
		style,
		weight,
	};
}
export function register(): void {
	CONFIG.fontDefinitions['Amplitude Bold'] = {
		editor: true,
		fonts: [buildDefinition('amplitude-32.ttf')],
	};
}
