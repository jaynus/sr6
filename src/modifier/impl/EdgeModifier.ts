import { ITest } from '@/test';
import { ModifierConstructorData, ModifierSourceData } from '@/modifier';
import { TestModifier, TestModifierSourceData } from '@/modifier/TestModifiers';
import { Target } from '@/data';

export interface BonusEdgeModifierSourceData extends TestModifierSourceData {
	value: number;
	loseIt: Maybe<boolean>; // TODO: implement
}

export class EdgeModifier extends TestModifier<BonusEdgeModifierSourceData> {
	override get displayValue(): undefined | string {
		if (this.value) {
			const number = this.value > 0 ? `+${this.value}` : this.value.toString();
			return `${number} Edge`;
		} else {
			return '-';
		}
	}

	get value(): number {
		return this.data!.value;
	}

	override isApplicable(testInterface: Maybe<ITest>): boolean {
		if (!testInterface) {
			return false;
		}

		if (!super.isApplicable(testInterface)) {
			return false;
		}

		return true;
	}

	async prepareTest<TTest extends ITest>(test: TTest): Promise<void> {
		test.setEdgeGain(Target.Self, test.getEdgeGain(Target.Self) + 1);
	}

	override toJSON(): ModifierSourceData {
		return {
			...super.toJSON(),
			value: this.value,
			skill: this.data.skill,
			attribute: this.data.attribute,
		};
	}

	constructor({ parent, source, target, conditions, data }: ModifierConstructorData<BonusEdgeModifierSourceData>) {
		data.class = 'EdgeModifier';

		super({ parent, source, target, conditions, data });
	}
}
