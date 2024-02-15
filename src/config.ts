import { config as configTests } from '@/test/index';
import { config as configModifiers } from '@/modifier';
import { config as configEdge } from '@/edge';
import { config as configEffects } from '@/effect';

export const SR6_CONFIG = {
	types: {
		tests: configTests(),
		modifiers: configModifiers(),
		effects: configEffects(),
		edge: configEdge(),
	},
};

export function register(): void {
	CONFIG.sr6 = SR6_CONFIG;
}

export function ready(): void {
	// CONFIG.sr6.useMagicalGirlSymbols = game.settings.get(SETTINGS_NAMESPACE, KEY_USE_MAGICAL_GIRL_SYMBOLS) as boolean;
}
