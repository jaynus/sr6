import { EnumAttribute } from '@/actor/data';
import LifeformDataModel from '@/actor/data/LifeformDataModel';
import BaseTest, { BaseTestData, TestConstructorData } from '@/test/BaseTest';
import { TestType } from '@/test/index';
import { RangedDefenseTestData } from '@/test/RangedTests';
import ChatComponent from '@/test/vue/chat/PhysicalSoakTest.vue';

import { Component } from 'vue';

export interface PhysicalSoakTestData extends BaseTestData {
	defenseTest: RangedDefenseTestData;
}

export default class PhysicalSoakTest extends BaseTest<PhysicalSoakTestData> {
	override get type(): TestType {
		return TestType.PhysicalSoak;
	}

	override get damage(): number {
		if (this.roll) {
			return this.baseDamage - this.roll.hits;
		} else {
			return this.baseDamage;
		}
	}

	get baseDamage(): number {
		return this.data.threshold!;
	}

	chatComponent(): Component {
		return ChatComponent;
	}

	override hasAttribute(attribute: EnumAttribute): boolean {
		return attribute === EnumAttribute.body;
	}

	constructor(args: TestConstructorData<PhysicalSoakTestData, LifeformDataModel>) {
		super(args);
	}
}
