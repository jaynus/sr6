/**
 *
 * @author jaynus
 * @file SR6 Items Root.
 */

import EdgeActionDataModel from '@/item/data/action/EdgeActionDataModel';
import KnowledgeDataModel from '@/item/data/feature/KnowledgeDataModel';
import WearableDataModel from '@/item/data/gear/WearableDataModel';
import SR6Item from '@/item/SR6Item';
import { register as registerSheets } from '@/item/sheets';
import { register as registerData } from '@/item/data';
import { constructOptGroup } from '@/util';

import GearDataModel from '@/item/data/gear/GearDataModel';
import WeaponDataModel from '@/item/data/gear/WeaponDataModel';
import AmmoDataModel from '@/item/data/AmmoDataModel';
import CredstickDataModel from '@/item/data/gear/CredstickDataModel';

import SkillDataModel from '@/item/data/feature/SkillDataModel';
import ContactDataModel from '@/item/data/feature/ContactDataModel';
import SINDataModel from '@/item/data/feature/SINDataModel';
import LifestyleDataModel from '@/item/data/feature/LifestyleDataModel';
import QualityDataModel from '@/item/data/feature/QualityDataModel';
import AdeptPowerDataModel from '@/item/data/feature/AdeptPowerDataModel';
import ComplexFormDataModel from '@/item/data/ComplexFormDataModel';
import AugmentationDataModel from '@/item/data/feature/AugmentationDataModel';
import SpellDataModel from '@/item/data/SpellDataModel';

import GeneralActionDataModel from '@/item/data/action/GeneralActionDataModel';
import MatrixActionDataModel from '@/item/data/action/MatrixActionDataModel';

import MatrixPersonaDataModel from '@/item/data/feature/MatrixPersonaDataModel';
import MatrixICDataModel from '@/item/data/MatrixICDataModel';
import ProgramDataModel from '@/item/data/ProgramDataModel';

export function register(): void {
	CONFIG.Item.documentClass = SR6Item;

	registerData();
	registerDataModels();
	registerSheets();
}

export const CharacterItemTypes = [
	'skill',
	'contact',
	'sin',
	'lifestyle',
	'augmentation',
	'quality',
	'adeptpower',
	'complexform',
];

export const GearItemTypes = ['weapon', 'gear', 'credstick', 'wearable'];

export const MatrixItemTypes = ['matrix_action', 'matrix_persona', 'matrix_ic'];

export const GameplayItemTypes = [];

function registerDataModels(): void {
	// Gear
	CONFIG.Item.dataModels.weapon = WeaponDataModel;
	CONFIG.Item.dataModels.wearable = WearableDataModel;
	CONFIG.Item.dataModels.ammo = AmmoDataModel;
	CONFIG.Item.dataModels.gear = GearDataModel;
	CONFIG.Item.dataModels.credstick = CredstickDataModel;

	// Character
	CONFIG.Item.dataModels.skill = SkillDataModel;
	CONFIG.Item.dataModels.contact = ContactDataModel;
	CONFIG.Item.dataModels.sin = SINDataModel;
	CONFIG.Item.dataModels.lifestyle = LifestyleDataModel;
	CONFIG.Item.dataModels.augmentation = AugmentationDataModel;
	CONFIG.Item.dataModels.quality = QualityDataModel;
	CONFIG.Item.dataModels.adeptpower = AdeptPowerDataModel;
	CONFIG.Item.dataModels.complexform = ComplexFormDataModel;
	CONFIG.Item.dataModels.spell = SpellDataModel;

	// Matrix
	CONFIG.Item.dataModels.matrix_action = MatrixActionDataModel;
	CONFIG.Item.dataModels.matrix_persona = MatrixPersonaDataModel;
	CONFIG.Item.dataModels.program = ProgramDataModel;
	CONFIG.Item.dataModels.matrix_ic = MatrixICDataModel;

	//
	CONFIG.Item.dataModels.general_action = GeneralActionDataModel;
	CONFIG.Item.dataModels.edge_action = EdgeActionDataModel;
	CONFIG.Item.dataModels.knowledge = KnowledgeDataModel;
}

export function setOptGroups(select: HTMLSelectElement): void {
	select.append(
		constructOptGroup(select, game.i18n.localize('SR6.DialogGroups.Item.Character'), CharacterItemTypes),
		constructOptGroup(select, game.i18n.localize('SR6.DialogGroups.Item.Gear'), GearItemTypes),
		constructOptGroup(select, game.i18n.localize('SR6.DialogGroups.Item.Matrix'), MatrixItemTypes),
		constructOptGroup(select, game.i18n.localize('SR6.DialogGroups.Item.Matrix'), GameplayItemTypes),
		constructOptGroup(select, game.i18n.localize('SR6.DialogGroups.Item.Other')),
	);
}

export async function onCreate(item: Item): Promise<void> {
	return (item as unknown as SR6Item)._onPostCreate();
}
