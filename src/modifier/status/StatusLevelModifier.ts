import { ModifierConstructorData } from '@/modifier';
import { TestModifier, TestModifierSourceData } from '@/modifier/TestModifiers';

export interface StatusLevelModifierSourceData extends TestModifierSourceData {
	level: number;
}

export abstract class StatusLevelModifier extends TestModifier<StatusLevelModifierSourceData> {
	get level(): number {
		return this.data.level;
	}

	override toJSON(): StatusLevelModifierSourceData {
		return {
			...super.toJSON(),
			level: this.data.level,
		};
	}

	protected constructor({
		parent,
		source,
		target,
		conditions,
		data,
	}: ModifierConstructorData<StatusLevelModifierSourceData>) {
		super({ parent, source, target, conditions, data });
	}
}
