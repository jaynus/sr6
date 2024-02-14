import BaseDataModel from '@/data/BaseDataModel';

export default abstract class AttributeDataModel extends BaseDataModel {
	abstract base: number;
	abstract mod: number;
	abstract value: number;

	get pool(): number {
		return this.solveFormula(`${this.value}`);
	}

	static defineSchema(): foundry.data.fields.DataSchema {
		const fields = foundry.data.fields;

		return {
			base: new fields.NumberField({ initial: 0, required: true, nullable: false, min: 0 }),
			mod: new fields.NumberField({ initial: 0, required: true, nullable: false, min: 0 }),
			value: new fields.NumberField({ initial: 2, required: true, nullable: false, min: 0 }),
			max: new fields.NumberField({ initial: 6, required: true, nullable: false, min: 0 }),
		};
	}

	override prepareDerivedData(): void {
		super.prepareDerivedData();
		this.value = this.base + this.mod;
	}
}
