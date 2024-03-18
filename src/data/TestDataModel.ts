import { EnumAttribute } from '@/actor/data';
import SR6Actor from '@/actor/SR6Actor';
import BaseDataModel from '@/data/BaseDataModel';
import { getClass } from '@/data/serialize';
import SR6Item from '@/item/SR6Item';
import { TestError, TestType } from '@/test';
import BaseTest from '@/test/BaseTest';
import { ConstructorOf } from '@/util';
import { Result, Ok, Err } from 'ts-results';

export default class TestDataModel extends BaseDataModel {
	declare parent: SR6Item | SR6Actor | BaseDataModel;

	declare testClass: Maybe<string>;

	declare attributes: EnumAttribute[];
	declare skill: Maybe<string>;

	async execute(): Promise<Result<null, TestError>> {
		if (!this.testClass) {
			ui.notifications.error('Cannot execute because no testClass specified');
			return Err(TestError.FailedConstructor);
		}

		const cls = getClass<ConstructorOf<BaseTest>>(CONFIG.sr6.types.tests, { class: this.testClass });
		if (cls.ok) {
			const test = new cls.val({ actor: this.actor!, item: this.item!, data: { pool: this.pool } });
			return test.execute();
		}
		return Ok(null);
	}

	get pool(): number {
		let formula = '';

		if (this.skill) {
			formula = `@${this.skill}`;
		}
		this.attributes.forEach((attribute) => {
			formula += `+ @${attribute}`;
		});

		return this.actor!.solveFormula(formula);
	}

	static defineSchema(): foundry.data.fields.DataSchema {
		const fields = foundry.data.fields;

		return {
			testClass: new fields.StringField({
				initial: undefined,
				required: false,
				nullable: true,
				blank: false,
				choices: Object.values(TestType),
			}),
			attributes: new fields.ArrayField(
				new fields.StringField({
					nullable: false,
					blank: false,
					required: true,
					// choices: () => Object.keys(EnumAttribute),
				}),
				{ initial: [] },
			),
			skill: new fields.StringField({ nullable: true, blank: false, required: false }),
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
