import EdgeActionDataModel from '@/item/data/action/EdgeActionDataModel';
import MatrixActionDataModel from '@/item/data/action/MatrixActionDataModel';
import GeneralActionDataModel from '@/item/data/action/GeneralActionDataModel';
import AdeptPowerDataModel from '@/item/data/feature/AdeptPowerDataModel';
import QualityDataModel from '@/item/data/feature/QualityDataModel';
import SkillDataModel from '@/item/data/feature/SkillDataModel';
import GearDataModel from '@/item/data/gear/GearDataModel';
import WeaponDataModel from '@/item/data/gear/WeaponDataModel';
import ProgramDataModel from '@/item/data/ProgramDataModel';
import SpellDataModel from '@/item/data/SpellDataModel';
import SR6Item from '@/item/SR6Item';

export async function getCoreSkills(): Promise<SR6Item<SkillDataModel>[]> {
	const pack = game.packs.get('sr6.sr6-crb-skills')!;

	return Array.from(
		(await pack.getDocuments())
			.filter((i) => (i as SR6Item).type === 'skill')
			.map((data) => game.items.fromCompendium(data as SR6Item, { addFlags: true }))
			.map((i) => i as unknown as SR6Item<SkillDataModel>),
	);
}

export async function getCoreMatrixActions(): Promise<SR6Item<MatrixActionDataModel>[]> {
	const pack = game.packs.get('sr6.sr6-crb-actions')!;

	return Array.from(
		(await pack.getDocuments())
			.filter((i) => (i as SR6Item).type === 'matrix_action')
			.map((data) => game.items.fromCompendium(data as SR6Item, { addFlags: true }))
			.map((i) => i as unknown as SR6Item<MatrixActionDataModel>),
	);
}

export async function getCoreGeneralActions(): Promise<SR6Item<GeneralActionDataModel>[]> {
	const pack = game.packs.get('sr6.sr6-crb-actions')!;

	return Array.from(
		(await pack.getDocuments())
			.filter((i) => (i as SR6Item).type === 'general_action')
			.map((data) => game.items.fromCompendium(data as SR6Item, { addFlags: true }))
			.map((i) => i as unknown as SR6Item<GeneralActionDataModel>),
	);
}

export async function getCoreEdgeActions(): Promise<SR6Item<EdgeActionDataModel>[]> {
	const pack = game.packs.get('sr6.sr6-crb-actions')!;

	return Array.from(
		(await pack.getDocuments())
			.filter((i) => (i as SR6Item).type === 'edge_action')
			.map((data) => game.items.fromCompendium(data as SR6Item, { addFlags: true }))
			.map((i) => i as unknown as SR6Item<EdgeActionDataModel>),
	);
}

export async function getCoreQualities(): Promise<SR6Item<QualityDataModel>[]> {
	const pack = game.packs.get('sr6.sr6-crb-qualities')!;

	return Array.from(
		(await pack.getDocuments())
			.filter((i) => (i as SR6Item).type === 'quality')
			.map((data) => game.items.fromCompendium(data as SR6Item, { addFlags: true }))
			.map((i) => i as unknown as SR6Item<QualityDataModel>),
	);
}

export async function getCoreAdeptPowers(): Promise<SR6Item<AdeptPowerDataModel>[]> {
	const pack = game.packs.get('sr6.sr6-crb-adeptpowers')!;

	return Array.from(
		(await pack.getDocuments())
			.filter((i) => (i as SR6Item).type === 'adeptpower')
			.map((data) => game.items.fromCompendium(data as SR6Item, { addFlags: true }))
			.map((i) => i as unknown as SR6Item<AdeptPowerDataModel>),
	);
}

export async function getCoreWeapons(): Promise<SR6Item<WeaponDataModel>[]> {
	const pack = game.packs.get('sr6.sr6-crb-weapons')!;

	return Array.from(
		(await pack.getDocuments())
			.filter((i) => (i as SR6Item).type === 'weapon')
			.map((data) => game.items.fromCompendium(data as SR6Item, { addFlags: true }))
			.map((i) => i as unknown as SR6Item<WeaponDataModel>),
	);
}

export async function getCoreGear(): Promise<SR6Item<GearDataModel>[]> {
	const pack = game.packs.get('sr6.sr6-crb-gear')!;

	return Array.from(
		(await pack.getDocuments())
			.map((data) => game.items.fromCompendium(data as SR6Item, { addFlags: true }))
			.map((i) => i as unknown as SR6Item<GearDataModel>),
	);
}

export async function getCoreSpells(): Promise<SR6Item<SpellDataModel>[]> {
	const pack = game.packs.get('sr6.sr6-crb-spells')!;

	return Array.from(
		(await pack.getDocuments())
			.filter((i) => (i as SR6Item).type === 'spell')
			.map((data) => game.items.fromCompendium(data as SR6Item, { addFlags: true }))
			.map((i) => i as unknown as SR6Item<SpellDataModel>),
	);
}

export async function getCorePrograms(): Promise<SR6Item<ProgramDataModel>[]> {
	const pack = game.packs.get('sr6.sr6-crb-matrix-items')!;

	return Array.from(
		(await pack.getDocuments())
			.filter((i) => (i as SR6Item).type === 'program')
			.map((data) => game.items.fromCompendium(data as SR6Item, { addFlags: true }))
			.map((i) => i as unknown as SR6Item<ProgramDataModel>),
	);
}

export async function getCoreAugmentations(): Promise<SR6Item<GeneralActionDataModel>[]> {
	const pack = game.packs.get('sr6.sr6-crb-augmentations')!;
	return Array.from(
		(await pack.getDocuments())
			.filter((i) => (i as SR6Item).type === 'augmentation')
			.map((data) => game.items.fromCompendium(data as SR6Item, { addFlags: true }))
			.map((i) => i as unknown as SR6Item<GeneralActionDataModel>),
	);
}

export function register(): void {}
