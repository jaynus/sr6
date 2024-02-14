import { ModifierConstructorData, ModifierSourceData } from '@/modifier';
import BaseModifier from '@/modifier/BaseModifier';

type PersonaModifierChangeEntry = {
	key: string;
	value: number;
};

export interface PersonaModifierSourceData extends ModifierSourceData {
	changes: PersonaModifierChangeEntry[];
}

export abstract class MatrixPersonaModifier extends BaseModifier<PersonaModifierSourceData> {
	override get displayValue(): undefined | string {
		console.warn('TODO');
		return 'TODO';
	}

	override toJSON(): ModifierSourceData {
		return {
			...super.toJSON(),
			changes: this.data.changes,
		};
	}

	protected constructor({
		parent,
		source,
		target,
		conditions,
		data,
	}: ModifierConstructorData<PersonaModifierSourceData>) {
		super({ parent, source, target, conditions, data });
	}
}
