import { EnumAttribute } from '@/actor/data';
import BaseActorDataModel from '@/actor/data/BaseActorDataModel';
import SR6Actor from '@/actor/SR6Actor';
import BaseDataModel from '@/data/BaseDataModel';
import SkillDataModel from '@/item/data/feature/SkillDataModel';
import SR6Item from '@/item/SR6Item';
import { toSnakeCase } from '@/util';

export default class SkillUseDataModel extends BaseDataModel {
	declare parent: SR6Item | SR6Actor | BaseDataModel;

	declare skill: string;
	declare attribute: EnumAttribute;
	declare specialization: null | string;

	get pool(): number {
		return this.solveFormula(
			`@${EnumAttribute[this.attribute]} + @${toSnakeCase(this.specialization || this.skill)}`,
		);
	}

	get(actor: SR6Actor<BaseActorDataModel> | null): null | SR6Item<SkillDataModel> {
		return actor ? actor.skill(this.skill) : this.actor!.skill(this.skill);
	}

	static defineSchema(): foundry.data.fields.DataSchema {
		const fields = foundry.data.fields;

		return {
			skill: new fields.StringField({ nullable: false, blank: false, required: true }),
			attribute: new fields.StringField({
				initial: null,
				nullable: true,
				blank: false,
				required: true,
				choices: () => Object.keys(EnumAttribute),
			}),
			specialization: new fields.StringField({ nullable: true, blank: false, required: true }),
		};
	}

	constructor(
		data?: DeepPartial<SourceFromSchema<foundry.data.fields.DataSchema>>,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		options?: DataModelConstructionOptions<any>,
	) {
		super(data, options);
	}
}
