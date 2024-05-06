import { EnumAttribute } from '@/actor/data';
import BaseActorDataModel from '@/actor/data/BaseActorDataModel';
import LifeformDataModel from '@/actor/data/LifeformDataModel';
import SR6Actor from '@/actor/SR6Actor';
import { EffectType } from '@/effect/SR6ActiveEffect';
import MatrixActionDataModel from '@/item/data/action/MatrixActionDataModel';
import SR6Item from '@/item/SR6Item';
import SR6Roll from '@/roll/SR6Roll';
import { AttackTestData, getAttackDataTargets } from '@/test/AttackTestData';
import BaseTest, { BaseTestData, TestConstructorData, TestSourceData } from '@/test/BaseTest';
import { ITest, RollDataDelta, TestType } from '@/test/index';
import ActionChatComponent from '@/test/vue/chat/MatrixActionTest.vue';
import DefenseChatComponent from '@/test/vue/chat/MatrixDefenseTest.vue';

import SoakChatComponent from '@/test/vue/chat/MatrixSoakTest.vue';

import ActionPromptComponent from '@/test/vue/prompt/MatrixActionTest.vue';

import DefensePromptComponent from '@/test/vue/prompt/MatrixDefenseTest.vue';
import { stripUndefined, getTargetActorIds } from '@/util';
import { Component } from 'vue';

export interface MatrixActionTestData extends AttackTestData {}

export class MatrixActionTest extends BaseTest<MatrixActionTestData> {
	override get type(): TestType {
		return TestType.MatrixAction;
	}

	get matrixAction(): SR6Item<MatrixActionDataModel> {
		return this.item! as SR6Item<MatrixActionDataModel>;
	}

	get canDefend(): boolean {
		return this.matrixAction.systemData.canDefend;
	}

	get canDamage(): boolean {
		return this.matrixAction.systemData.canDamage;
	}

	override get damage(): number {
		if (this.canDamage) {
			let rollData = {};
			if (this.roll) {
				rollData = this.roll.getRollData();
			}

			return this.matrixAction.systemData.getDamage(rollData);
		}

		return 0;
	}

	get baseDamage(): number {
		if (this.canDamage) {
			return this.matrixAction.systemData.getDamage();
		}

		return 0;
	}

	opposed(actor: SR6Actor<BaseActorDataModel>, item: undefined | SR6Item = undefined): MatrixDefenseTest {
		if (this.matrixAction.systemData.canDefend) {
			return new MatrixDefenseTest({
				actor,
				item,
				data: {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					opposedData: this.toJSON() as any,
				},
			});
		}
		throw 'Attempting opposed roll on something that isnt canDefend';
	}

	soak(defenseTest: MatrixDefenseTest): ITest {
		if (this.matrixAction.systemData.canSoak) {
			return new MatrixSoakTest({
				actor: defenseTest.actor,
				data: {
					threshold: this.damage,
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					defenseTest: defenseTest.toJSON() as any,
				},
			});
		}
		throw 'Attempting opposed roll on something that isnt canSoak';
	}

	override hasAttribute(attribute: EnumAttribute): boolean {
		return this.matrixAction.systemData.skillUse
			? this.matrixAction.systemData.skillUse?.attribute === attribute
			: attribute === EnumAttribute.logic;
	}

	override hasSkill(skill: string): boolean {
		return (
			this.matrixAction.systemData.skillUse?.skill === skill ||
			this.matrixAction.systemData.skillUse?.specialization === skill
		);
	}

	chatComponent(): Component {
		return ActionChatComponent;
	}

	promptComponent(): Component {
		return ActionPromptComponent;
	}

	protected override async _onUse(): Promise<void> {
		await this.matrixAction.systemData.use(getAttackDataTargets(this.data));
	}

	constructor({
		actor,
		item,
		data,
		roll,
		delta,
	}: {
		actor: SR6Actor<BaseActorDataModel>;
		item: SR6Item;
		data?: MatrixActionTestData;
		roll?: SR6Roll;
		delta?: RollDataDelta;
	}) {
		const matrixAction = item as SR6Item<MatrixActionDataModel>;
		const defaultData = {
			targetIds: getTargetActorIds(),
			damage: matrixAction.systemData.getDamage(),
			attackRating: matrixAction.systemData.getAttackRating(),
			pool: matrixAction.systemData.pool,
		};

		if (data) {
			stripUndefined(data);
		}

		super({
			actor,
			item,
			data: data
				? foundry.utils.mergeObject(data, defaultData, { overwrite: false, inplace: true })
				: defaultData,
			roll,
			delta,
		});
	}
}

export interface MatrixDefenseTestData extends BaseTestData {
	opposedData: TestSourceData<MatrixActionTestData>;
}

export class MatrixDefenseTest extends BaseTest<MatrixDefenseTestData> {
	override get type(): TestType {
		return TestType.MatrixDefense;
	}

	opposedTest: MatrixActionTest;

	protected override async _onFailure(): Promise<void> {
		await this.opposedTest.matrixAction.systemData.applyEffects(
			EffectType.OnHit,
			getAttackDataTargets(this.opposedTest.data),
		);
	}

	override get damage(): number {
		return Math.max(0, this.opposedTest.damage - (this.roll?.hits || 0));
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

	constructor({
		actor,
		item,
		data,
		delta,
		roll,
	}: {
		actor: SR6Actor;
		item?: SR6Item;
		data: MatrixDefenseTestData;
		delta?: RollDataDelta;
		roll?: SR6Roll;
	}) {
		// Set the threshold automatically from the opposed data
		const opposedTest = BaseTest.fromData<MatrixActionTest>(data.opposedData);
		if (opposedTest.ok) {
			data.threshold = opposedTest.val.roll?.hits;
			if (actor.systemData instanceof LifeformDataModel) {
				data.pool = actor.solveFormula(
					opposedTest.val.matrixAction.systemData.formulas.defend!,
					opposedTest.val.roll?.getRollData(),
				);
			} else {
				data.pool = actor.solveFormula(
					opposedTest.val.matrixAction.systemData.formulas.deviceDefend!,
					opposedTest.val.roll?.getRollData(),
				);
			}
		} else {
			throw opposedTest.val;
		}

		super({ actor, item, data, roll, delta });

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		this.opposedTest = opposedTest.val;
	}
}

export interface MatrixSoakTestData extends AttackTestData {
	defenseTest: TestSourceData<MatrixDefenseTestData>;
}

export class MatrixSoakTest extends BaseTest<MatrixSoakTestData> {
	override get type(): TestType {
		return TestType.MatrixSoak;
	}

	defenseTest: MatrixDefenseTest;

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

	constructor(args: TestConstructorData<MatrixSoakTestData>) {
		const defenseTest = BaseTest.fromData<MatrixDefenseTest>(args.data.defenseTest);
		if (defenseTest.ok) {
			args.data.threshold = defenseTest.val.damage;
			args.data.pool = args.actor.solveFormula(
				defenseTest.val.opposedTest.matrixAction.systemData.formulas.soak!,
			);
		}
		super(args);

		if (defenseTest.ok) {
			this.defenseTest = defenseTest.val;
		} else {
			throw 'err';
		}
	}
}
