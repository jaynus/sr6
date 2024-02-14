import { InitiativeType } from '@/data';
import { AvailableActions } from '@/data/interfaces';
import { ModifierConstructorData, ModifierSourceData } from '@/modifier';
import BaseModifier from '@/modifier/BaseModifier';
import { InitiativeRollData } from '@/roll/InitiativeRoll';
import { ITest } from '@/test';

export interface InitiativeModifierSourceData extends ModifierSourceData {
	diceFormula?: string;
	scoreFormula?: string;
	type?: InitiativeType;
}

export abstract class InitiativeModifier extends BaseModifier<InitiativeModifierSourceData> {
	override isApplicable(test: Maybe<ITest> = null, _roll: Maybe<Roll> = null): boolean {
		return !test;
	}

	override get displayValue(): undefined | string {
		console.warn('TODO');
		return 'TODO';
	}

	prepareInitiative?(
		type: InitiativeType,
		initiative: Maybe<InitiativeRollData>,
		_actions: Maybe<AvailableActions>,
	): void {
		if (this.data.type) {
			if (this.data.type !== type) {
				return;
			}
		}

		if (initiative) {
			// initiative!.dice += this.data.dice || 0;
			// initiative!.score += this.data.score || 0;
			// if (actions) {
			//	actions!.minor = 1 + initiative.dice;
			// }
		}
	}

	override toJSON(): ModifierSourceData {
		return {
			...super.toJSON(),
			diceFormula: this.data.diceFormula,
			scoreFormula: this.data.scoreFormula,
			type: this.data.type,
		};
	}

	protected constructor({
		parent,
		source,
		target,
		conditions,
		data,
	}: ModifierConstructorData<InitiativeModifierSourceData>) {
		super({ parent, source, target, conditions, data });
	}
}
