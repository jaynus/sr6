/**
 *
 * @author jaynus
 * @file Effect registration
 */
import { ClassData, getClass } from '@/data/serialize';
import SR6ActiveEffect from '@/effect/SR6ActiveEffect';
import { BurningEffect } from '@/effect/impl/BurningEffect';
import SR6ActiveEffectSheet from '@/effect/SR6ActiveEffectSheet';
import { SR6StatusEffects } from '@/effect/StatusEffects';

export function register(): void {
	CONFIG.ActiveEffect.legacyTransferral = false;
	CONFIG.ActiveEffect.documentClass = SR6ActiveEffect;

	DocumentSheetConfig.unregisterSheet(ActiveEffect, 'core', ActiveEffectConfig);
	DocumentSheetConfig.registerSheet(ActiveEffect, 'sr6', SR6ActiveEffectSheet, {
		makeDefault: true,
	});

	CONFIG.statusEffects = SR6StatusEffects;
}

export function config(): Record<string, unknown> {
	return {
		BurningEffect: BurningEffect,
	};
}
