import BaseItemDataModel from '@/item/data/BaseItemDataModel';

export enum ProgramType {
	Basic = 'basic',
	Hacking = 'hacking',
}
export default abstract class ProgramDataModel extends BaseItemDataModel {
	abstract type: ProgramType;

	static override defineSchema(): foundry.data.fields.DataSchema {
		const fields = foundry.data.fields;
		return {
			...super.defineSchema(),
			type: new fields.StringField({
				initial: ProgramType.Basic,
				required: true,
				nullable: false,
				blank: false,
				choices: Object.values(ProgramType),
			}),
		};
	}
}
