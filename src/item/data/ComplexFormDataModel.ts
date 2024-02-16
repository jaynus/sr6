import { Duration } from '@/data';
import TestDataModel from '@/data/TestDataModel';
import BaseItemDataModel from '@/item/data/BaseItemDataModel';

export type ComplexFormDurationData = {
	type: Duration;
	value: number;
};

export type ComplexFormTestData = {
	use: Maybe<TestDataModel>;
	opposed: Maybe<TestDataModel>;
};

export default abstract class ComplexFormDataModel extends BaseItemDataModel {
	abstract duration: ComplexFormDurationData;
	abstract fadeFormula: string;

	abstract tests: ComplexFormTestData;

	get fade(): number {
		return this.solveFormula(this.fadeFormula);
	}

	static override defineSchema(): foundry.data.fields.DataSchema {
		const fields = foundry.data.fields;

		return {
			...super.defineSchema(),
			duration: new fields.SchemaField(
				{
					type: new fields.StringField({
						initial: Duration.Instantaneous,
						required: true,
						nullable: false,
						blank: false,
						choices: Object.values(Duration),
					}),
					value: new fields.NumberField({ initial: 1, required: false, nullable: false, integer: true }),
				},
				{ required: true, nullable: false },
			),
			tests: new fields.SchemaField({
				use: new fields.EmbeddedDataField(TestDataModel, {
					initial: undefined,
					required: false,
					nullable: true,
				}),
				opposed: new fields.EmbeddedDataField(TestDataModel, {
					initial: undefined,
					required: false,
					nullable: true,
				}),
			}),
			fadeFormula: new fields.StringField({ initial: '0', required: true, nullable: false }),
		};
	}
}
