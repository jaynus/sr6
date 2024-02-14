import { Duration } from '@/data';
import BaseItemDataModel from '@/item/data/BaseItemDataModel';

export type ComplexFormFormulas = {
	fade: string;
	test: string;
};

export type ComplexFormDurationData = {
	type: Duration;
	value: number;
};

export default abstract class ComplexFormDataModel extends BaseItemDataModel {
	abstract duration: ComplexFormDurationData;
	abstract formulas: ComplexFormFormulas;

	get fade(): number {
		return this.solveFormula(this.formulas.fade);
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
			formulas: new fields.SchemaField({
				fade: new fields.StringField({ initial: '0', required: true, nullable: false }),
				test: new fields.StringField({ initial: null, required: true, nullable: true }),
			}),
		};
	}
}
