import { ModifierConstructorData } from '@/modifier';
import { TestModifier, TestModifierSourceData } from '@/modifier/TestModifiers';

export interface StatusLevelModifierSourceData extends TestModifierSourceData {
	level: number;
}

export abstract class StatusLevelModifier<
	TSourceData extends StatusLevelModifierSourceData = StatusLevelModifierSourceData,
> extends TestModifier<TSourceData> {
	get level(): number {
		return this.data.level;
	}

	override toJSON(): StatusLevelModifierSourceData {
		return {
			...super.toJSON(),
			level: this.data.level,
		};
	}

	protected constructor({ parent, source, target, conditions, data }: ModifierConstructorData<TSourceData>) {
		super({ parent, source, target, conditions, data });
	}
}
