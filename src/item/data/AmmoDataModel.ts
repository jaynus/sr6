import BaseItemDataModel from '@/item/data/BaseItemDataModel';
import { GearAvailabilityDataModel } from '@/item/data/gear/GearDataModel';

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
