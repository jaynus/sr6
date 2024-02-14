import { DocumentUUIDField } from '@/data/fields';
import BaseItemDataModel from '@/item/data/BaseItemDataModel';

export enum SINRating {
	One = 1,
	Two = 2,
	Three = 3,
	Four = 4,
	Five = 5,
	Six = 6,
}
const SIN_RATING_BOUND = { min: 1, max: 6 };

export default abstract class SINDataModel extends BaseItemDataModel {
	abstract rating: number;
	abstract costFormula: string;

	abstract licensedGearIds: ItemUUID[];

	get cost(): number {
		return this.solveFormula(this.costFormula);
	}

	static override defineSchema(): foundry.data.fields.DataSchema {
		const fields = foundry.data.fields;
		return {
			...super.defineSchema(),

			rating: new fields.NumberField({
				initial: 1,
				required: true,
				nullable: false,
				integer: true,
				min: SIN_RATING_BOUND.min,
				max: SIN_RATING_BOUND.max,
			}),
			costFormula: new fields.StringField({ initial: '0', nullable: false, required: true, blank: false }),
			licensedGearIds: new fields.ArrayField(new DocumentUUIDField(), {
				initial: [],
				required: true,
				nullable: false,
			}),
		};
	}
}
