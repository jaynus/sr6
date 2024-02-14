import { ModifierConstructorData, ModifierSourceData } from '@/modifier';
import BaseModifier from '@/modifier/BaseModifier';
import { ITest } from '@/test';

export interface BlockActionModifierSourceData extends ModifierSourceData {
	actions: string[];
}

export abstract class BlockActionModifier extends BaseModifier<BlockActionModifierSourceData> {
	override isApplicable(_test: Maybe<ITest> = null, _roll: Maybe<Roll> = null): boolean {
		return false;
	}

	override get displayValue(): undefined | string {
		console.warn('TODO');
		return 'TODO';
	}

	override toJSON(): ModifierSourceData {
		return {
			...super.toJSON(),
			actions: this.data.actions,
		};
	}

	protected constructor({
		parent,
		source,
		target,
		conditions,
		data,
	}: ModifierConstructorData<BlockActionModifierSourceData>) {
		super({ parent, source, target, conditions, data });
	}
}
