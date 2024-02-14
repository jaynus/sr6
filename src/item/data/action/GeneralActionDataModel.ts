import BaseActionDataModel from '@/item/data/action/BaseActionDataModel';

export enum GeneralActionCategory {
	Social = 'social',
	Combat = 'combat',
	General = 'general',
	Magic = 'magic',
}

export default abstract class GeneralActionDataModel extends BaseActionDataModel {
	abstract category: GeneralActionCategory;

	static override defineSchema(): foundry.data.fields.DataSchema {
		const fields = foundry.data.fields;
		return {
			...super.defineSchema(),
			category: new fields.StringField({
				initial: GeneralActionCategory.General,
				required: true,
				nullable: false,
				blank: false,
				choices: Object.values(GeneralActionCategory),
			}),
		};
	}
}
