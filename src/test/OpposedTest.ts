import SR6Actor from '@/actor/SR6Actor';
import SR6Item from '@/item/SR6Item';
import SR6Roll from '@/roll/SR6Roll';
import BaseTest, { BaseTestData, TestSourceData } from '@/test/BaseTest';
import { RollDataDelta } from '@/test/index';

export interface OpposedTestData<TDefenseTestData extends BaseTestData> extends BaseTestData {
	defenseTestData: TestSourceData<TDefenseTestData>[];
}

export default abstract class OpposedTest<
	TDefenseTestData extends BaseTestData = BaseTestData,
	TDefenseTest extends BaseTest<TDefenseTestData> = BaseTest<TDefenseTestData>,
	TAttackTestData extends OpposedTestData<TDefenseTestData> = OpposedTestData<TDefenseTestData>,
> extends BaseTest<OpposedTestData<TDefenseTestData>> {
	defenseTests: TDefenseTest[];

	constructor({
		actor,
		item,
		data,
		delta,
		roll,
	}: {
		actor: SR6Actor;
		item?: SR6Item;
		data: TAttackTestData;
		delta?: RollDataDelta;
		roll?: SR6Roll;
	}) {
		super({ actor, item, data, roll, delta });

		this.defenseTests = [];
		if (this.baseData.defenseTestData) {
			this.baseData.defenseTestData.forEach((data) => {
				const defenseTest = BaseTest.fromData<TDefenseTest, TDefenseTestData>(data);
				if (defenseTest.ok) {
					this.defenseTests.push(defenseTest.val);
				} else {
					throw `Failed to deserialize defense test ${data.type}`;
				}
			});
		} else {
			this.baseData.defenseTestData = [];
		}
	}
}
