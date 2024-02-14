/**
 *
 * @author jaynus
 * @file Item Sheet Registration
 */

import AdeptPowerSheet from '@/vue/sheets/item/AdeptPowerSheet.vue';
import AugmentationSheet from '@/vue/sheets/item/AugmentationSheet.vue';
import BasicGearSheet from '@/vue/sheets/item/BasicGearSheet.vue';
import ComplexFormSheet from '@/vue/sheets/item/ComplexFormSheet.vue';
import ContactSheet from '@/vue/sheets/item/ContactSheet.vue';
import CredstickSheet from '@/vue/sheets/item/CredstickSheet.vue';
import EdgeActionSheet from '@/vue/sheets/item/EdgeActionSheet.vue';
import GeneralActionSheet from '@/vue/sheets/item/GeneralActionSheet.vue';
import LifestyleSheet from '@/vue/sheets/item/LifestyleSheet.vue';
import QualitySheet from '@/vue/sheets/item/QualitySheet.vue';
import SpellSheet from '@/vue/sheets/item/SpellSheet.vue';
import WeaponSheet from '@/vue/sheets/item/WeaponSheet.vue';
import VueSheet from '@/vue/VueSheet';
import { Component } from 'vue';
import SR6ItemSheet from '@/item/SR6ItemSheet';

import MatrixICSheet from '@/vue/sheets/item/MatrixICSheet.vue';
import MatrixActionSheet from '@/vue/sheets/item/MatrixActionSheet.vue';
import SkillSheet from '@/vue/sheets/item/SkillSheet.vue';

import { SR6ItemSheetData, ItemSheetContext } from '@/vue/SheetContext';

/*
type VueSheetConstructor = new (...args: any[]) => {
	get vueComponent(): Component;
	getVueContext(): Promise<ItemSheetContext | undefined>;
};
 */

/**
 * Constructs a vue-based ItemSheet subclass with little extra processing.
 * @param vueComponent Vue component to use for the sheet.
 * @param sheetType Base class to use for the sheet.
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function basicSheet(vueComponent: Component, sheetType: any = VueSheet(SR6ItemSheet)): typeof sheetType {
	return class extends sheetType {
		get vueComponent(): Component {
			return vueComponent;
		}

		async getVueContext(): Promise<ItemSheetContext | undefined> {
			const thisAsSheet = this as unknown as SR6ItemSheet;
			return {
				sheet: thisAsSheet,
				data: (await thisAsSheet.getData()) as SR6ItemSheetData,
				user: game.user!,
			};
		}
	};
}

/**
 * Registers Item sheets used by the system.
 */
export function register(): void {
	Items.unregisterSheet('core', ItemSheet);

	/*
	Items.registerSheet('sr6', basicSheet(BasicItemSheet), {
		types: [
		],
		makeDefault: true,
	});
	*/

	Items.registerSheet('sr6', basicSheet(BasicGearSheet), {
		types: ['gear', 'weapon', 'wearable'],
		makeDefault: true,
	});

	Items.registerSheet('sr6', basicSheet(WeaponSheet), {
		types: ['weapon'],
		makeDefault: true,
	});

	Items.registerSheet('sr6', basicSheet(AdeptPowerSheet), {
		types: ['adeptpower'],
		makeDefault: true,
	});

	Items.registerSheet('sr6', basicSheet(AugmentationSheet), {
		types: ['augmentation'],
		makeDefault: true,
	});

	Items.registerSheet('sr6', basicSheet(ComplexFormSheet), {
		types: ['complexform'],
		makeDefault: true,
	});

	Items.registerSheet('sr6', basicSheet(ContactSheet), {
		types: ['contact'],
		makeDefault: true,
	});

	Items.registerSheet('sr6', basicSheet(CredstickSheet), {
		types: ['credstick'],
		makeDefault: true,
	});

	Items.registerSheet('sr6', basicSheet(EdgeActionSheet), {
		types: ['edge_action'],
		makeDefault: true,
	});

	Items.registerSheet('sr6', basicSheet(GeneralActionSheet), {
		types: ['general_action'],
		makeDefault: true,
	});

	Items.registerSheet('sr6', basicSheet(LifestyleSheet), {
		types: ['lifestyle'],
		makeDefault: true,
	});

	Items.registerSheet('sr6', basicSheet(MatrixActionSheet), {
		types: ['matrix_action'],
		makeDefault: true,
	});

	Items.registerSheet('sr6', basicSheet(MatrixICSheet), {
		types: ['matrix_ic'],
		makeDefault: true,
	});

	Items.registerSheet('sr6', basicSheet(QualitySheet), {
		types: ['quality'],
		makeDefault: true,
	});

	Items.registerSheet('sr6', basicSheet(SkillSheet), {
		types: ['skill'],
		makeDefault: true,
	});

	Items.registerSheet('sr6', basicSheet(SpellSheet), {
		types: ['spell'],
		makeDefault: true,
	});
}
