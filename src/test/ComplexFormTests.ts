import LifeformDataModel from '@/actor/data/LifeformDataModel';
import SR6Actor from '@/actor/SR6Actor';
import ComplexFormDataModel from '@/item/data/ComplexFormDataModel';
import SR6Item from '@/item/SR6Item';
import { AttackTestData } from '@/test/AttackTestData';
import BaseTest, { BaseTestData, TestConstructorData, TestSourceData } from '@/test/BaseTest';
import { TestType } from '@/test/index';
import { stripUndefined, getTargetActorIds } from '@/util';

export interface ComplexFormUseTestData extends AttackTestData {
	fade?: number;
}

export class ComplexFormUseTest extends BaseTest<ComplexFormUseTestData> {
	override get type(): TestType {
		return TestType.ComplexFormUse;
	}

	complexForm: SR6Item<ComplexFormDataModel>;

	get hasOpposed(): boolean {
		return this.complexForm.systemData.tests.opposed !== null;
	}

	opposed(actor: SR6Actor<LifeformDataModel>, item: undefined | SR6Item = undefined): ComplexFormOpposedTest {
		if (this.complexForm.systemData.tests.opposed !== null) {
			return new ComplexFormOpposedTest({
				actor,
				item,
				data: {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					opposedData: this.toJSON() as any,
				},
			});
		}
		throw 'err';
	}

	constructor(args: TestConstructorData<ComplexFormUseTestData, LifeformDataModel>) {
		const complexForm = args.item as SR6Item<ComplexFormDataModel>;
		const defaultData = {
			targetIds: getTargetActorIds(),
			pool: complexForm.systemData.tests.use!.pool,
			fade: complexForm.systemData.fade,
		};
		stripUndefined(args.data);
		args.data = args.data
			? foundry.utils.mergeObject(args.data, defaultData, { overwrite: false, inplace: true })
			: defaultData;

		super(args);
		this.complexForm = complexForm;
	}
}

export interface ComplexFormFadeTestData extends BaseTestData {
	opposedData: TestSourceData<ComplexFormUseTestData>;
}

export class ComplexFormFadeTest extends BaseTest<ComplexFormFadeTestData> {
	override get type(): TestType {
		return TestType.ComplexFormFade;
	}

	opposedTest: ComplexFormUseTest;

	constructor(args: TestConstructorData<ComplexFormFadeTestData, LifeformDataModel>) {
		// Set the threshold automatically from the opposed data
		const opposedTest = BaseTest.fromData<ComplexFormUseTest>(args.data.opposedData);
		if (opposedTest.ok) {
			args.data.threshold = opposedTest.val.data.fade;
			args.data.pool = args.actor.systemData.fadePool;
		} else {
			throw opposedTest.val;
		}

		super(args);

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.opposedTest = opposedTest.val;
	}
}

export interface ComplexFormOpposedTestData extends BaseTestData {
	opposedData: TestSourceData<ComplexFormUseTestData>;
}

export class ComplexFormOpposedTest extends BaseTest<ComplexFormOpposedTestData> {
	override get type(): TestType {
		return TestType.ComplexFormOpposed;
	}

	opposedTest: ComplexFormUseTest;

	constructor(args: TestConstructorData<ComplexFormOpposedTestData>) {
		// Set the threshold automatically from the opposed data
		const opposedTest = BaseTest.fromData<ComplexFormUseTest>(args.data.opposedData);
		if (opposedTest.ok) {
			args.data.threshold = opposedTest.val.roll?.hits;
			// TODO: pool
		} else {
			throw opposedTest.val;
		}

		super(args);

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.opposedTest = opposedTest.val;
	}
}
