import { DocumentUUIDField } from '@/data/fields';
import BaseItemDataModel from '@/item/data/BaseItemDataModel';

export enum LifestyleRating {
	Street = 1,
	Squatter = 2,
	Low = 3,
	Middle = 4,
	High = 5,
	Luxury = 6,
}
export default abstract class LifestyleDataModel extends BaseItemDataModel {
	abstract rating: number;
	abstract costFormula: string;
	abstract monthsPaid: number;
	abstract sin: Maybe<ItemUUID>;

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
				min: LifestyleRating.Street,
				max: LifestyleRating.Luxury,
			}),

			costFormula: new fields.StringField({ initial: '0', nullable: false, required: true, blank: false }),
			monthsPaid: new fields.NumberField({ initial: 1, nullable: false, required: true }),
			sin: new DocumentUUIDField({ initial: null, required: true, nullable: true }),
		};
	}
}
