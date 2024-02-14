import GearDataModel from '@/item/data/gear/GearDataModel';
import { ITest } from '@/test';

export enum WearableSlot {
	Clothes = 'clothes',
	Armor = 'armor',
	Head = 'head',
}

export type WearableFormulaData = {
	defenseRatingFormula: string;
	socialRatingFormula: string;
};

export default abstract class WearableDataModel extends GearDataModel {
	abstract capacity: number;
	abstract formulas: WearableFormulaData;
	abstract slots: WearableSlot[];

	override defenseRating(_test: Maybe<ITest> = null): number {
		return this.solveFormula(this.formulas.defenseRatingFormula);
	}

	override get socialRating(): number {
		return 0;
	}

	static override defineSchema(): foundry.data.fields.DataSchema {
		const fields = foundry.data.fields;

		return {
			...super.defineSchema(),
			capacity: new fields.NumberField({ initial: 0 }),
			slots: new fields.ArrayField(
				new fields.StringField({
					initial: WearableSlot.Clothes,
					required: true,
					nullable: false,
					blank: false,
					choices: Object.values(WearableSlot),
				}),
				{ initial: [], nullable: false, required: true },
			),
			formulas: new fields.SchemaField(
				{
					defenseRatingFormula: new fields.StringField({
						initial: '0',
						nullable: false,
						required: true,
						blank: false,
					}),
					socialRatingFormula: new fields.StringField({
						initial: '0',
						nullable: false,
						required: true,
						blank: false,
					}),
				},
				{ required: true, nullable: false },
			),
		};
	}
}
