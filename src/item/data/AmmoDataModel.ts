import BaseItemDataModel from '@/item/data/BaseItemDataModel';
import { GearAvailabilityDataModel } from '@/item/data/gear/GearDataModel';

export enum AmmoStorageType {
	Clip = 'c',
	InternalMagazine = 'm',
	Cylinder = 'cy',
	Barrel = 'z',
	BreakAction = 'a',
	Belt = 'b',
}

export enum AmmoType {
	Taser = 'taser',
	Shotgun = 'shotgun',
	Light = 'light',
	Heavy = 'heavy',
	Rifle = 'rifle',
	MachineGun = 'machinegun',
}
export default abstract class AmmoDataModel extends BaseItemDataModel {
	static override defineSchema(): foundry.data.fields.DataSchema {
		const fields = foundry.data.fields;

		return {
			...super.defineSchema(),
			count: new fields.NumberField({ initial: 0, min: 0, integer: true, required: true, nullable: false }),

			costFormula: new fields.StringField({ initial: '0', nullable: false, required: true, blank: false }),
			availability: new fields.EmbeddedDataField(GearAvailabilityDataModel, { required: true, nullable: false }),

			damageModifierFormula: new fields.StringField({
				initial: '0',
				nullable: false,
				required: true,
				blank: false,
			}),
			attackRatingModifierFormula: new fields.StringField({
				initial: '0',
				nullable: false,
				required: true,
				blank: false,
			}),
		};
	}
}
