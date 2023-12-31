import BaseItemDataModel from '@/item/data/BaseItemDataModel';

export default abstract class ComplexFormDataModel extends BaseItemDataModel {
	static override defineSchema(): foundry.data.fields.DataSchema {
		const fields = foundry.data.fields;
		return {
			...super.defineSchema(),
		};
	}
}
