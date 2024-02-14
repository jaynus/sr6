import { EnumAttribute } from '@/actor/data';
import LifeformDataModel from '@/actor/data/LifeformDataModel';
import { TestType } from '@/test';
import BaseTest, { BaseTestData, TestConstructorData } from '@/test/BaseTest';
import ChatComponent from '@/test/vue/chat/SimpleTest.vue';
import PromptComponent from '@/test/vue/prompt/SimpleTest.vue';
import { Component } from 'vue/dist/vue';

export class ComposureTest extends BaseTest {
	override get type(): TestType {
		return TestType.Composure;
	}

	chatComponent(): Component {
		return ChatComponent;
	}

	promptComponent(): Component {
		return PromptComponent;
	}

	override hasAttribute(attribute: EnumAttribute): boolean {
		return EnumAttribute.willpower === attribute || EnumAttribute.charisma === attribute;
	}

	constructor(args: TestConstructorData<BaseTestData, LifeformDataModel>) {
		if (!args.data.pool) {
			args.data.pool =
				args.actor.systemData.attribute(EnumAttribute.willpower).value +
				args.actor.systemData.attribute(EnumAttribute.charisma).value;
		}
		super(args);
	}
}

export class JudgeIntentionsTest extends ComposureTest {
	override get type(): TestType {
		return TestType.JudgeIntentions;
	}

	override hasAttribute(attribute: EnumAttribute): boolean {
		return EnumAttribute.willpower === attribute || EnumAttribute.intuition === attribute;
	}

	constructor(args: TestConstructorData<BaseTestData, LifeformDataModel>) {
		if (!args.data.pool) {
			args.data.pool =
				args.actor.systemData.attribute(EnumAttribute.willpower).value +
				args.actor.systemData.attribute(EnumAttribute.intuition).value;
		}
		super(args);
	}
}

export class LiftCarryTest extends ComposureTest {
	override get type(): TestType {
		return TestType.LiftCarry;
	}

	override hasAttribute(attribute: EnumAttribute): boolean {
		return EnumAttribute.willpower === attribute || EnumAttribute.body === attribute;
	}

	constructor(args: TestConstructorData<BaseTestData, LifeformDataModel>) {
		if (!args.data.pool) {
			args.data.pool =
				args.actor.systemData.attribute(EnumAttribute.willpower).value +
				args.actor.systemData.attribute(EnumAttribute.body).value;
		}
		super(args);
	}
}
