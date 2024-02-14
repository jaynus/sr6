import { ITest } from '@/test/index.js';
import { ModifierConstructorData, ModifierSourceData } from '@/modifier/index.js';
import { PoolModifier, PoolModifierSourceData } from '@/modifier/TestModifiers.js';

export interface WoundModifierSourceData extends PoolModifierSourceData {
	value: number;
}

export class WoundModifier extends PoolModifier<WoundModifierSourceData> {
	override isApplicable(test: Maybe<ITest> = null): boolean {
		if (this.value === 0) {
			return false;
		}
		return super.isApplicable(test);
	}

	override toJSON(): ModifierSourceData {
		return {
			...super.toJSON(),
			value: this.value,
		};
	}

	constructor({ parent, source, conditions, target, data }: ModifierConstructorData<WoundModifierSourceData>) {
		data.class = data.class || 'WoundModifier';
		data.name = data.name || 'SR6.Modifiers.PhysicalWoundModifier.Name';
		data.description = data.description || 'SR6.Modifiers.PhysicalWoundModifier.Description';

		super({ parent, source, conditions, target, data });
	}
}
