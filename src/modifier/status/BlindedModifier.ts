import { ModifierConstructorData } from '@/modifier';
import { StatusLevelModifier, StatusLevelModifierSourceData } from '@/modifier/status/StatusLevelModifier';
import { ITest } from '@/test';

export class BlindedModifier extends StatusLevelModifier {
	async prepareTest<TTest extends ITest>(test: TTest): Promise<void> {
		test.data.pool! += -3 * this.level;
	}

	constructor({ parent, source, target, conditions, data }: ModifierConstructorData<StatusLevelModifierSourceData>) {
		data.class = 'BlindedModifier';
		data.testClasses = data.testClasses || [
			'RangedAttackTest',
			'RangedDefenseTest',
			'MeleeAttackTest',
			'MeleeDefenseTest',
			'SpellCastTest',
			'SpellDefenseTest',
		];

		super({ parent, source, target, conditions, data });
	}
}
