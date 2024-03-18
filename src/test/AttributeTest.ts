import { EnumAttribute } from '@/actor/data';
import LifeformDataModel from '@/actor/data/LifeformDataModel';
import BaseTest, { BaseTestData, TestConstructorData } from '@/test/BaseTest';
import { TestType } from '@/test/index';
import ChatComponent from '@/test/vue/chat/AttributeTest.vue';
import { Component } from 'vue';

export interface AttributeTestData extends BaseTestData {
	attribute: EnumAttribute;
}

export default class AttributeTest extends BaseTest<AttributeTestData> {
	override get type(): TestType {
		return TestType.Attribute;
	}

	chatComponent(): Component {
		return ChatComponent;
	}

	override hasAttribute(attribute: EnumAttribute): boolean {
		return this.data.attribute === attribute;
	}

	constructor(args: TestConstructorData<AttributeTestData, LifeformDataModel>) {
		args.data!.pool = args.actor.systemData.attribute(args.data!.attribute).pool;
		super(args);
	}
}
