import { EnumAttribute } from '@/actor/data';
import SR6Actor from '@/actor/SR6Actor';
import { FireMode } from '@/data';
import SR6Item from '@/item/SR6Item';
import { ModifierConstructorData, ModifierSourceData } from '@/modifier';
import BaseModifier from '@/modifier/BaseModifier';
import { ITest } from '@/test';
import { AttackTestData } from '@/test/AttackTestData';
import { RangedAttackTestData } from '@/test/RangedTests';

export interface TestModifierSourceData extends ModifierSourceData {
	testClasses?: string[];
	testItemNames?: string[];
	skills?: string[];
	attributes?: EnumAttribute[];
}

export abstract class TestModifier<TSourceData extends TestModifierSourceData> extends BaseModifier<TSourceData> {
	override isApplicable(test: Maybe<ITest> = null, _roll: Maybe<Roll> = null): boolean {
		if (!super.isApplicable(test)) {
			return false;
		}

		if (test) {
			if (this.data.testItemNames && test.item?.name && !this.data.testItemNames.includes(test.item!.name)) {
				return false;
			}
			if (this.data.testClasses && !this.data.testClasses.includes(test.type)) {
				return false;
			}
			if (this.data.attributes && this.data.attributes.find((attr) => !test.hasAttribute(attr))) {
				return false;
			}
			if (this.data.skills && this.data.skills.find((skill) => !test.hasSkill(skill))) {
				return false;
			}
		}

		return true;
	}

	override toJSON(): ModifierSourceData {
		return {
			...super.toJSON(),
			testClasses: this.data.testClasses,
			testItemNames: this.data.testItemNames,
			skills: this.data.skills,
			attributes: this.data.attributes,
		};
	}

	protected constructor({ parent, source, conditions, target, data }: ModifierConstructorData<TSourceData>) {
		super({ parent, source, conditions, target, data });
	}
}

export interface TestFunctionModifierSourceData extends TestModifierSourceData {
	prepareTestScript: string;
	finishTestScript: string;
}

export class TestFunctionModifier<
	TSourceData extends TestFunctionModifierSourceData = TestFunctionModifierSourceData,
> extends TestModifier<TSourceData> {
	prepareTest?: Function;
	finishTest?: Function;

	override toJSON(): ModifierSourceData {
		return {
			...super.toJSON(),
			prepareTestScript: this.prepareTest?.toString(),
			finishTestScript: this.finishTest?.toString(),
		};
	}

	constructor({ parent, source, conditions, target, data }: ModifierConstructorData<TSourceData>) {
		super({ parent, source, conditions, target, data });

		this.prepareTest = data.prepareTestScript ? Function('test', data.prepareTestScript) : undefined;
		this.finishTest = data.finishTestScript ? Function('test', data.finishTestScript) : undefined;
	}
}

export interface PoolModifierSourceData extends TestModifierSourceData {
	value?: number;
	valueFormula?: string;
}

export class PoolModifier<TData extends PoolModifierSourceData = PoolModifierSourceData> extends TestModifier<TData> {
	override get displayValue(): undefined | string {
		const number = this.value > 0 ? `+${this.value}` : this.value.toString();
		return `${number} Pool`;
	}

	get value(): number {
		return this.data!.value!;
	}

	async prepareTest<TTest extends ITest>(test: TTest): Promise<void> {
		test.pool += this.value;
	}

	override toJSON(): ModifierSourceData {
		return {
			...super.toJSON(),
			value: this.data.value,
			valueFormula: this.data.valueFormula,
		};
	}

	constructor({ parent, source, conditions, target, data }: ModifierConstructorData<TData>) {
		if (data.valueFormula) {
			if (source instanceof SR6Item) {
				data.value = (source as SR6Item).solveFormula(data.valueFormula!);
			} else if (source instanceof SR6Actor) {
				data.value = (source as SR6Actor).solveFormula(data.valueFormula!);
			}
		}

		super({ parent, source, conditions, target, data });
	}
}

export interface AttackRatingModifierSourceData extends PoolModifierSourceData {
	firemodes?: FireMode[];
}

export class AttackRatingModifier extends PoolModifier<AttackRatingModifierSourceData> {
	get firemodes(): FireMode[] {
		return this.data.firemodes || [];
	}

	override isModifying(test: ITest): boolean {
		if (this.firemodes.length === 0) {
			return true;
		}
		const firemode = (test.data as RangedAttackTestData).firemode;
		if (!firemode) {
			return false;
		}

		return this.firemodes.includes(firemode);
	}

	override isApplicable(test: Maybe<ITest> = null, _roll: Maybe<Roll> = null): boolean {
		if (!super.isApplicable(test)) {
			return false;
		}

		return true;
	}

	override get displayValue(): undefined | string {
		const number = this.value > 0 ? `+${this.value}` : this.value.toString();
		return `${number} AR`;
	}

	override async prepareTest<TTest extends ITest>(test: TTest): Promise<void> {
		const data = test.data as AttackTestData;
		if (data.attackRating) {
			data.attackRating += this.value;
		}
	}

	override toJSON(): ModifierSourceData {
		return {
			...super.toJSON(),
			firemodes: this.data.firemodes,
		};
	}
}

export class DefenseRatingModifier extends PoolModifier {
	override get displayValue(): undefined | string {
		const number = this.value > 0 ? `+${this.value}` : this.value.toString();
		return `${number} DR`;
	}

	// TODO:
	async prepareOpposedTest<TTest extends ITest>(_test: TTest): Promise<void> {
		ui.notifications.warn('Defense rating modifiers not implemented yet');
	}
}

export class DamageModifier extends PoolModifier {
	override get displayValue(): undefined | string {
		const number = this.value > 0 ? `+${this.value}` : this.value.toString();
		return `${number} Damage`;
	}

	override async prepareTest<TTest extends ITest>(test: TTest): Promise<void> {
		const data = test.data as AttackTestData;
		if (data.damage) {
			data.damage += this.value;
		}
	}
}

export class ThresholdModifier extends PoolModifier {
	override get displayValue(): undefined | string {
		const number = this.value > 0 ? `+${this.value}` : this.value.toString();
		return `${number} Threshold`;
	}

	override async prepareTest<TTest extends ITest>(test: TTest): Promise<void> {
		const data = test.data as AttackTestData;
		if (data.threshold) {
			data.threshold += this.value;
		}
	}
}
