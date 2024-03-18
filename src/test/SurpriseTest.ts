import { EnumAttribute } from '@/actor/data';
import LifeformDataModel from '@/actor/data/LifeformDataModel';
import { TestType } from '@/test';
import BaseTest, { BaseTestData, TestConstructorData } from '@/test/BaseTest';

export class SurpriseTest extends BaseTest {
	override get type(): TestType {
		return TestType.Surprise;
	}

	override hasAttribute(attribute: EnumAttribute): boolean {
		switch (attribute) {
			case EnumAttribute.reaction:
			case EnumAttribute.intuition:
				return true;
		}
		return false;
	}

	constructor(args: TestConstructorData<BaseTestData, LifeformDataModel>) {
		args.data.pool =
			args.actor.systemData.attribute(EnumAttribute.reaction).value +
			args.actor.systemData.attribute(EnumAttribute.intuition).value;

		super(args);
	}
}
