import LifeformDataModel from '@/actor/data/LifeformDataModel';
import SR6Actor from '@/actor/SR6Actor';
import SpellDataModel, { damageFromSpellAdjustments, drainFromSpellAdjustments } from '@/item/data/SpellDataModel';
import { SpellAdjustments, SpellAdjustmentType } from '@/data/magic';
import SR6Item from '@/item/SR6Item';
import { AttackTestData } from '@/test/AttackTestData';
import BaseTest, { BaseTestData, TestConstructorData, TestSourceData } from '@/test/BaseTest';
import { ITest, TestType } from '@/test/index';
import { getTargetActorIds } from '@/util';
import { Result } from 'ts-results';
import { Component } from 'vue';

import ActionPromptComponent from '@/test/vue/prompt/SpellCastTest.vue';
import ActionChatComponent from '@/test/vue/chat/SpellCastTest.vue';

import DrainChatComponent from '@/test/vue/chat/SpellDrainTest.vue';

import DefensePromptComponent from '@/test/vue/prompt/SpellDefenseTest.vue';
import DefenseChatComponent from '@/test/vue/chat/SpellDefenseTest.vue';

import SoakChatComponent from '@/test/vue/chat/SpellSoakTest.vue';

export interface SpellCastTestData extends AttackTestData {
	drain?: number;
	adjustments?: SpellAdjustments;
}

export class SpellCastTest extends BaseTest<SpellCastTestData> {
	override get type(): TestType {
		return TestType.SpellCast;
	}

	spell: SR6Item<SpellDataModel>;

	get canDefend(): boolean {
		return this.spell.systemData.canDefend;
	}

	get canSoak(): boolean {
		return this.spell.systemData.canSoak;
	}

	get baseDamage(): number {
		return this.spell.systemData.getDamage();
	}

	override get damage(): number {
		if (this.roll) {
			return (
				this.spell.systemData.getDamage(this.roll.getRollData()) +
				damageFromSpellAdjustments(this.data.adjustments!)
			);
		} else {
			return this.spell.systemData.getDamage() + damageFromSpellAdjustments(this.data.adjustments!);
		}
	}

	override async performRoll(): Promise<Result<null, string>> {
		// save amp values and then execute
		this.data.drain = this.baseData.drain! + drainFromSpellAdjustments(this.data.adjustments!);
		this.data.damage = this.baseData.damage! + drainFromSpellAdjustments(this.data.adjustments!);

		return super.performRoll();
	}

	opposed(actor: SR6Actor<LifeformDataModel>, item: undefined | SR6Item = undefined): SpellDefenseTest {
		if (this.spell.systemData.canDefend) {
			return new SpellDefenseTest({
				actor,
				item,
				data: {
					threshold: this.roll!.hits,
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					opposedData: this.toJSON() as any,
				},
			});
		}
		throw 'err';
	}

	soak(defenseTest: SpellDefenseTest): ITest {
		if (this.spell.systemData.canSoak) {
			return new SpellSoakTest({
				actor: defenseTest.actor as SR6Actor<LifeformDataModel>,
				data: {
					threshold: this.data.damage,
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					defenseTest: defenseTest.toJSON() as any,
				},
			});
		}
		throw 'err';
	}

	chatComponent(): Component {
		return ActionChatComponent;
	}

	promptComponent(): Component {
		return ActionPromptComponent;
	}

	constructor(args: TestConstructorData<SpellCastTestData, LifeformDataModel>) {
		const spell = args.item as SR6Item<SpellDataModel>;
		const defaultData = {
			targetIds: getTargetActorIds(),
			damage: spell.systemData.getDamage(),
			attackRating: spell.systemData.getAttackRating(),
			pool: spell.systemData.pool,
			drain: spell.systemData.drain,
			adjustments: {
				[SpellAdjustmentType.AmpUp]: 0,
				[SpellAdjustmentType.IncreaseArea]: 0,
				[SpellAdjustmentType.ShiftArea]: 0,
			},
		};

		args.data = args.data
			? foundry.utils.mergeObject(args.data, defaultData, { overwrite: false, inplace: true })
			: defaultData;

		super(args);
		this.spell = spell;
	}
}

export interface SpellDrainTestData extends BaseTestData {
	opposedData: TestSourceData<SpellCastTestData>;
}

export class SpellDrainTest extends BaseTest<SpellDrainTestData> {
	override get type(): TestType {
		return TestType.SpellDrain;
	}

	opposedTest: SpellCastTest;

	chatComponent(): Component {
		return DrainChatComponent;
	}

	get drain(): number {
		if (this.roll) {
			return Math.max(0, this.opposedTest.data.drain! - this.roll!.hits);
		} else {
			return this.opposedTest.data.drain!;
		}
	}

	constructor(args: TestConstructorData<SpellDefenseTestData, LifeformDataModel>) {
		// Set the threshold automatically from the opposed data
		const opposedTest = BaseTest.fromData<SpellCastTest>(args.data.opposedData);
		if (opposedTest.ok) {
			args.data.threshold = opposedTest.val.data.drain!;
			args.data.pool = args.actor.systemData.spellDrainPool;
		} else {
			throw opposedTest.val;
		}

		super(args);

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.opposedTest = opposedTest.val;
	}
}

export interface SpellDefenseTestData extends BaseTestData {
	opposedData: TestSourceData<SpellCastTestData>;
}

export class SpellDefenseTest extends BaseTest<SpellDefenseTestData> {
	override get type(): TestType {
		return TestType.SpellDefense;
	}

	opposedTest: SpellCastTest;

	override get damage(): number {
		if (this.roll) {
			return (
				this.opposedTest.spell.systemData.getDamage(
					this.opposedTest.roll!.getRollData(),
					this.roll.getRollData(),
				) + damageFromSpellAdjustments(this.opposedTest.data.adjustments!)
			);
		} else {
			return (
				this.opposedTest.spell.systemData.getDamage() +
				damageFromSpellAdjustments(this.opposedTest.data.adjustments!)
			);
		}
	}

	get baseDamage(): number {
		return this.opposedTest.baseDamage;
	}

	promptComponent(): Component {
		return DefensePromptComponent;
	}

	chatComponent(): Component {
		return DefenseChatComponent;
	}

	constructor(args: TestConstructorData<SpellDefenseTestData, LifeformDataModel>) {
		// Set the threshold automatically from the opposed data
		const opposedTest = BaseTest.fromData<SpellCastTest>(args.data.opposedData);
		if (opposedTest.ok) {
			args.data.threshold = opposedTest.val.roll?.hits;
			args.data.pool = opposedTest.val.spell.systemData.getDefensePool(args.actor);
		} else {
			throw opposedTest.val;
		}

		super(args);

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.opposedTest = opposedTest.val;
	}
}

export interface SpellSoakTestData extends AttackTestData {
	defenseTest: TestSourceData<SpellDefenseTestData>;
}

export class SpellSoakTest extends BaseTest<SpellSoakTestData> {
	override get type(): TestType {
		return TestType.SpellSoak;
	}

	defenseTest: SpellDefenseTest;

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
		return SoakChatComponent;
	}

	constructor(args: TestConstructorData<SpellSoakTestData, LifeformDataModel>) {
		const defenseTest = BaseTest.fromData<SpellDefenseTest>(args.data.defenseTest);
		if (defenseTest.ok && args.data) {
			args.data!.threshold = defenseTest.val.damage;
			args.data!.pool = defenseTest.val.opposedTest.spell.systemData.getSoakPool(args.actor);
		}
		super(args);

		if (defenseTest.ok) {
			this.defenseTest = defenseTest.val;
		} else {
			throw 'err';
		}
	}
}
