import MonitorsDataModel, { WoundModifierData } from '@/actor/data/MonitorsDataModel';
import BaseDataModel from '@/data/BaseDataModel';
import AdeptPowerDataModel from '@/item/data/feature/AdeptPowerDataModel';
import AugmentationDataModel from '@/item/data/feature/AugmentationDataModel';
import ComplexFormDataModel from '@/item/data/ComplexFormDataModel';
import ContactDataModel from '@/item/data/feature/ContactDataModel';
import KnowledgeDataModel from '@/item/data/feature/KnowledgeDataModel';
import LifestyleDataModel from '@/item/data/feature/LifestyleDataModel';
import MatrixPersonaDataModel, { PersonaType } from '@/item/data/feature/MatrixPersonaDataModel';
import { MatrixAttributesData } from '@/data/MatrixAttributesDataModel';
import QualityDataModel from '@/item/data/feature/QualityDataModel';
import SINDataModel from '@/item/data/feature/SINDataModel';
import SkillDataModel from '@/item/data/feature/SkillDataModel';
import CredstickDataModel from '@/item/data/gear/CredstickDataModel';
import GearDataModel from '@/item/data/gear/GearDataModel';
import WeaponDataModel from '@/item/data/gear/WeaponDataModel';
import WearableDataModel from '@/item/data/gear/WearableDataModel';
import ProgramDataModel from '@/item/data/ProgramDataModel';

import SR6Item from '@/item/SR6Item';
import { ITest } from '@/test';

export default abstract class BaseActorDataModel extends BaseDataModel {
	abstract monitors: MonitorsDataModel;
	abstract description: string;
	abstract source: string;

	get skills(): SkillDataModel[] {
		return this.actor!.items.filter((i) => i.type === 'skill').map(
			(i) => (i as SR6Item<SkillDataModel>).systemData,
		);
	}

	get knowledge(): KnowledgeDataModel[] {
		return this.actor!.items.filter((i) => i.type === 'knowledge').map(
			(i) => (i as SR6Item<KnowledgeDataModel>).systemData,
		);
	}

	get gear(): GearDataModel[] {
		return this.actor!.items.filter((i) => i.type === 'gear').map((i) => (i as SR6Item<GearDataModel>).systemData);
	}

	get augmentations(): AugmentationDataModel[] {
		return this.actor!.items.filter((i) => i.type === 'augmentation').map(
			(i) => (i as SR6Item<AugmentationDataModel>).systemData,
		);
	}

	get contacts(): ContactDataModel[] {
		return this.actor!.items.filter((i) => i.type === 'contact').map(
			(i) => (i as SR6Item<ContactDataModel>).systemData,
		);
	}

	get lifestyles(): LifestyleDataModel[] {
		return this.actor!.items.filter((i) => i.type === 'lifestyle').map(
			(i) => (i as SR6Item<LifestyleDataModel>).systemData,
		);
	}

	get sins(): SINDataModel[] {
		return this.actor!.items.filter((i) => i.type === 'sin').map((i) => (i as SR6Item<SINDataModel>).systemData);
	}

	get qualities(): QualityDataModel[] {
		return this.actor!.items.filter((i) => i.type === 'quality').map(
			(i) => (i as SR6Item<QualityDataModel>).systemData,
		);
	}

	get credsticks(): CredstickDataModel[] {
		return this.actor!.items.filter((i) => i.type === 'credstick').map(
			(i) => (i as SR6Item<CredstickDataModel>).systemData,
		);
	}

	get adeptPowers(): AdeptPowerDataModel[] {
		return this.actor!.items.filter((i) => i.type === 'adeptpower').map(
			(i) => (i as SR6Item<AdeptPowerDataModel>).systemData,
		);
	}

	get complexForms(): ComplexFormDataModel[] {
		return this.actor!.items.filter((i) => i.type === 'complexform').map(
			(i) => (i as SR6Item<ComplexFormDataModel>).systemData,
		);
	}

	get matrixPrograms(): ProgramDataModel[] {
		return this.actor!.items.filter((i) => i.type === 'program').map(
			(i) => (i as SR6Item<ProgramDataModel>).systemData,
		);
	}

	get weapons(): WeaponDataModel[] {
		return this.actor!.items.filter((i) => i.type === 'weapon').map(
			(i) => (i as SR6Item<WeaponDataModel>).systemData,
		);
	}

	get wearables(): WearableDataModel[] {
		return this.actor!.items.filter((i) => i.type === 'wearable').map(
			(i) => (i as SR6Item<WearableDataModel>).systemData,
		);
	}

	get baseDefenseRating(): number {
		return 0;
	}

	defenseRating(_test: Maybe<ITest>): number {
		return 0;
	}

	get woundModifiers(): WoundModifierData {
		return {};
	}

	get woundModifier(): number {
		return Object.entries(this.woundModifiers).reduce((acc, [_key, value]) => (acc += value), 0);
	}

	get totalNuyen(): number {
		return [...this.actor!.credsticks.map((item: SR6Item<CredstickDataModel>) => item.systemData.nuyen), 0].reduce(
			(total, nuyen) => total + nuyen,
		);
	}

	protected get _matrixPersona(): null | MatrixPersonaDataModel {
		const persona = this.actor!.items.find((i) => i.type === 'matrix_persona')! as SR6Item<MatrixPersonaDataModel>;
		return persona ? persona.systemData : null;
	}

	protected set _matrixPersona(newPersona: null | MatrixPersonaDataModel) {
		const persona = this.actor!.items.find((i) => i.type === 'matrix_persona')! as SR6Item<MatrixPersonaDataModel>;
		if (newPersona && persona) {
			persona.systemData.sourceDeviceId = newPersona.sourceDeviceId;
			persona.systemData.attributes = newPersona.attributes;
			persona.systemData.type = newPersona.type;
		} else if (persona) {
			this.actor!.items.delete(persona.id);
		}
	}

	getHighestMatrixAttributes(): MatrixAttributesData {
		const highest: MatrixAttributesData = {
			attack: 0,
			sleaze: 0,
			dataProcessing: 0,
			firewall: 0,
			formulas: null,
		};
		this.actor!.items.filter((i) => i.type === 'gear')
			.map((i) => i as SR6Item<GearDataModel>)
			.filter((i) => i.systemData.matrix?.attributes)
			.map((i) => i.systemData.matrix!.attributes!)
			.forEach((i) => {
				highest.attack = Math.max(highest.attack, i.attack);
				highest.sleaze = Math.max(highest.sleaze, i.sleaze);
				highest.dataProcessing = Math.max(highest.dataProcessing, i.dataProcessing);
				highest.firewall = Math.max(highest.firewall, i.firewall);
			});

		return highest;
	}

	protected async _activateMatrixPersona(
		device: SR6Item<GearDataModel> | null = null,
	): Promise<SR6Item<MatrixPersonaDataModel>> {
		// Remove any existing persona
		this.actor!.items.filter((i) => i.type === 'matrix_persona').forEach((i) => i.delete());

		const personaType = device ? PersonaType.Device : PersonaType.Living;

		const attributes =
			personaType === PersonaType.Device
				? this.getHighestMatrixAttributes()
				: {
						formulas: {
							attack: '@charisma',
							sleaze: '@intuition',
							dataProcessing: '@logic',
							firewall: '@willpower',
						},
					};

		// create it
		const persona = (
			await this.actor!.createEmbeddedDocuments('Item', [
				{
					type: 'matrix_persona',
					name: `${this.actor!.name} persona`,
					system: {
						sourceDeviceId: device ? device.uuid : null,
						type: personaType,
						attributes: {
							base: attributes,
							current: attributes,
						},
					},
				},
			])
		)[0] as SR6Item<MatrixPersonaDataModel>;

		// Bugfix, because of the differeing types of data the creation fails, we need to update the partials instead
		// await persona.update({ ['system.attributes.base']: attributes, ['system.attributes.current']: attributes });

		return persona;
	}

	override prepareBaseData(): void {
		super.prepareBaseData();
	}

	override prepareData(): void {
		super.prepareData();
	}

	override prepareDerivedData(): void {
		super.prepareDerivedData();
	}

	override getRollData(): Record<string, unknown> {
		return super.getRollData();
	}

	static defineSchema(): foundry.data.fields.DataSchema {
		const fields = foundry.data.fields;
		return {
			description: new fields.HTMLField(),
			source: new fields.StringField(),
		};
	}
}
