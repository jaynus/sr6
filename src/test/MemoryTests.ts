import { EnumAttribute } from '@/actor/data';
import LifeformDataModel from '@/actor/data/LifeformDataModel';
import KnowledgeDataModel from '@/item/data/feature/KnowledgeDataModel';
import SR6Item from '@/item/SR6Item';
import { TestType } from '@/test';
import BaseTest, { BaseTestData, TestConstructorData } from '@/test/BaseTest';
import ChatComponent from '@/test/vue/chat/MemoryTest.vue';
import PromptComponent from '@/test/vue/prompt/MemoryTest.vue';
import { Component } from 'vue';

export class MemoryTest extends BaseTest {
	knowledge: Maybe<SR6Item<KnowledgeDataModel>>;

	override get type(): TestType {
		return TestType.Memory;
	}

	chatComponent(): Component {
		return ChatComponent;
	}

	promptComponent(): Component {
		return PromptComponent;
	}

	override hasAttribute(attribute: EnumAttribute): boolean {
		switch (attribute) {
			case EnumAttribute.logic:
			case EnumAttribute.intuition:
				return true;
		}
		return false;
	}

	constructor(args: TestConstructorData<BaseTestData, LifeformDataModel>) {
		const knowledge = args.item as SR6Item<KnowledgeDataModel> | undefined;
		if (!args.data.pool) {
			if (knowledge) {
				args.data.pool = knowledge.systemData.pool;
			} else {
				args.data.pool =
					args.actor.systemData.attribute(EnumAttribute.logic).value +
					args.actor.systemData.attribute(EnumAttribute.intuition).value;
			}
		}

		super(args);
		this.knowledge = knowledge;
	}
}

export class KnowledgeTest extends MemoryTest {}

export class LanguageTest extends KnowledgeTest {}
