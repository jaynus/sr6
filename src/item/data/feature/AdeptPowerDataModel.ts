import QualityDataModel from '@/item/data/feature/QualityDataModel';

export default abstract class AdeptPowerDataModel extends QualityDataModel {
	abstract level: number;
	abstract maxLevel: number;
	abstract powerCost: number;

	override getRollData(): Record<string, unknown> {
		return {
			...super.getRollData(),
			level: this.level,
		};
	}

	static override defineSchema(): foundry.data.fields.DataSchema {
		const fields = foundry.data.fields;
		return {
			...super.defineSchema(),
			level: new fields.NumberField({
				initial: 1,
				required: true,
				nullable: false,
				integer: true,
				min: 1,
			}),
			maxLevel: new fields.NumberField({
				initial: 6,
				required: true,
				nullable: false,
				integer: true,
				min: 1,
			}),
			powerCost: new fields.NumberField({
				initial: 1,
				required: true,
				nullable: false,
				integer: false,
				min: 0,
			}),
		};
	}
}
