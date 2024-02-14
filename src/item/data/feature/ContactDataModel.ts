import BaseItemDataModel from '@/item/data/BaseItemDataModel';

export default abstract class ContactDataModel extends BaseItemDataModel {
	abstract rating: number;
	abstract loyalty: number;

	get pool(): number {
		return this.actor!.solveFormula(`@charisma + @influence + ${this.loyalty}`);
	}

	get connectionPool(): number {
		return this.rating + this.rating;
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
				min: 1,
				max: 6,
			}),
			loyalty: new fields.NumberField({
				initial: 1,
				required: true,
				nullable: false,
				integer: true,
				min: 1,
				max: 6,
			}),
		};
	}
}
