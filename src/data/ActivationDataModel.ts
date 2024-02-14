import BaseDataModel from '@/data/BaseDataModel';
import { ActivationMode, ActivationPeriod, ActivationType } from '@/data/index';

export abstract class ActivationDataModel extends BaseDataModel {
	abstract type: ActivationType;
	abstract period: ActivationPeriod;
	abstract mode: ActivationMode;
	abstract status: boolean;

	override prepareBaseData(): void {
		if (this.type === ActivationType.Passive) {
			this.status = true;
		}
	}

	static defineSchema(): foundry.data.fields.DataSchema {
		const fields = foundry.data.fields;

		return {
			type: new fields.StringField({
				initial: ActivationType.Passive,
				nullable: false,
				required: true,
				blank: false,
				choices: Object.values(ActivationType),
			}),
			period: new fields.StringField({
				initial: ActivationPeriod.Any,
				nullable: false,
				required: true,
				blank: false,
				choices: Object.values(ActivationPeriod),
			}),
			mode: new fields.StringField({
				initial: ActivationMode.Manual,
				nullable: false,
				required: true,
				blank: false,
				choices: Object.values(ActivationMode),
			}),
			status: new fields.BooleanField({ initial: false, required: true, nullable: false }),
		};
	}
}
