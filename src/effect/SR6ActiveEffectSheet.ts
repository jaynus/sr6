/**
 *
 * @author jaynus
 * @file ActiveEffect configuration sheet
 */

// import './SR6ActiveEffectSheet.scss';
import { EFFECT_MODES } from '@/effect/SR6ActiveEffect';

export default class SR6ActiveEffectSheet extends ActiveEffectConfig {
	override async getData(options?: DocumentSheetOptions): Promise<ActiveEffectConfigData> {
		const data = await super.getData(options);

		Object.getOwnPropertyNames(EFFECT_MODES).forEach((propertyName: string) => {
			if (!data.modes[EFFECT_MODES[propertyName as keyof typeof EFFECT_MODES]]) {
				data.modes[EFFECT_MODES[propertyName as keyof typeof EFFECT_MODES]] = game.i18n.localize(
					`SR6.ActiveEffects.Modes.${propertyName}`,
				);
			}
		});

		return data;
	}

	override get template(): string {
		return 'systems/sr6/templates/sheets/effect-config.hbs';
	}
}
