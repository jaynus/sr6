import { EnumAttribute } from '@/actor/data';
import SR6Actor from '@/actor/SR6Actor';
import SR6Item from '@/item/SR6Item';
import SR6Roll from '@/roll/SR6Roll';
import BaseTest, { BaseTestData } from '@/test/BaseTest';
import { RollDataDelta, TestType } from '@/test/index';
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

	constructor({
		actor,
		item,
		data,
		delta,
		roll,
	}: {
		actor: SR6Actor;
		item?: SR6Item;
		data: PhysicalSoakTestData;
		delta?: RollDataDelta;
		roll?: SR6Roll;
	}) {
		super({ actor, item, data, delta, roll });
	}
}
