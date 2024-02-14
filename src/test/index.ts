import { EnumAttribute } from '@/actor/data';
import SR6Actor from '@/actor/SR6Actor';
import { Target } from '@/data';
import { IEdgeBoost } from '@/edge';
import SR6Item from '@/item/SR6Item';
import { IModifier } from '@/modifier';
import SR6Roll from '@/roll/SR6Roll';
import { BaseTestData } from '@/test/BaseTest';
import ContactTest from '@/test/ContactTest';
import { MeleeAttackTest, MeleeDefenseTest } from '@/test/MeleeTests';
import { KnowledgeTest, LanguageTest, MemoryTest } from '@/test/MemoryTests';
import { ComposureTest, JudgeIntentionsTest, LiftCarryTest } from '@/test/SimpleTests';
import { SurpriseTest } from '@/test/SurpriseTest';

import { Component } from 'vue';
import { Result } from 'ts-results';

/* Tests */
import AttributeTest from '@/test/AttributeTest';
import SkillTest from '@/test/SkillTest';
import { RangedAttackTest, RangedDefenseTest } from '@/test/RangedTests';
import PhysicalSoakTest from '@/test/PhysicalSoakTest';

import { MatrixActionTest, MatrixDefenseTest, MatrixSoakTest } from '@/test/MatrixTests';
import { SpellCastTest, SpellDrainTest, SpellDefenseTest, SpellSoakTest } from '@/test/SpellTests';
export type RollDataDelta = Record<string, unknown>;

export enum TestError {
	Cancelled,
	RollFailed,
	MissingDocument,
	FailedConstructor,
}

export enum TestType {
	INVALID = 'INVALID',
	Attribute = 'AttributeTest',
	Skill = 'SkillTest',
	Contact = 'ContactTest',

	RangedAttack = 'RangedAttackTest',
	RangedDefense = 'RangedDefenseTest',

	MeleeAttack = 'MeleeAttackTest',
	MeleeDefense = 'MeleeDefenseTest',

	PhysicalSoak = 'PhysicalSoakTest',

	MatrixAction = 'MatrixActionTest',
	MatrixDefense = 'MatrixDefenseTest',
	MatrixSoak = 'MatrixSoakTest',

	SpellCast = 'SpellCastTest',
	SpellDrain = 'SpellDrainTest',
	SpellDefense = 'SpellDefenseTest',
	SpellSoak = 'SpellSoakTest',

	// Memory
	Memory = 'MemoryTest',
	Knowledge = 'KnowledgeTest',
	Language = 'LanguageTest',

	// Misc
	Composure = 'ComposureTest',
	JudgeIntentions = 'JudgeIntentionsTest',
	LiftCarry = 'LiftCarryTest',
	Surprise = 'SurpriseTest',
}
export function config(): Record<string, unknown> {
	return {
		// misc
		AttributeTest: AttributeTest,
		SkillTest: SkillTest,
		ContactTest: ContactTest,

		// combat
		RangedAttackTest: RangedAttackTest,
		RangedDefenseTest: RangedDefenseTest,

		MeleeAttackTest: MeleeAttackTest,
		MeleeDefenseTest: MeleeDefenseTest,

		PhysicalSoakTest: PhysicalSoakTest,

		// Matrix
		MatrixActionTest: MatrixActionTest,
		MatrixDefenseTest: MatrixDefenseTest,
		MatrixSoakTest: MatrixSoakTest,

		// Magic
		SpellCastTest: SpellCastTest,
		SpellDrainTest: SpellDrainTest,
		SpellDefenseTest: SpellDefenseTest,
		SpellSoakTest: SpellSoakTest,

		// Logic
		MemoryTest: MemoryTest,
		KnowledgeTest: KnowledgeTest,
		LanguageTest: LanguageTest,

		// Misc
		ComposureTest: ComposureTest,
		JudgeIntentionsTest: JudgeIntentionsTest,
		LiftCarryTest: LiftCarryTest,
		SurpriseTest: SurpriseTest,
	};
}

export interface ITestModifierData {
	disabled: boolean;
	source: Target;
	modifier: IModifier;
}

export interface ITest<TData extends BaseTestData = BaseTestData> {
	actor: SR6Actor;
	item?: SR6Item;

	roll?: SR6Roll;

	edgeBoost?: IEdgeBoost;

	get allModifiers(): ITestModifierData[];
	get activeModifiers(): ITestModifierData[];

	// Modifier helpers
	hasAttribute(attribute: EnumAttribute): boolean;
	hasSkill(skill: string): boolean;

	get type(): TestType;

	get isOwner(): boolean;

	get damage(): Maybe<number>;

	get data(): TData;
	set data(data: TData);

	get pool(): number;
	set pool(newValue: number);

	reset(): Promise<void>;

	promptComponent?(): Component;
	chatComponent?(): Component;

	execute(): Promise<Result<null, TestError>>;

	toJSON(): Record<string, unknown>;

	// edge control
	canGainEdge(target: Target): boolean;
	canSpendEdge(target: Target): boolean;

	getEdgeGain(target: Target): number;

	setEdgeGain(target: Target, value: number): boolean;

	get availableEdge(): number;
	applyEdgeBoost(boost: IEdgeBoost): Promise<boolean>;
}
export function register(): void {}
