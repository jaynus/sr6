import { ModifierConstructorData } from '@/modifier';
import { StatusLevelModifier, StatusLevelModifierSourceData } from '@/modifier/status/StatusLevelModifier';
import { ITest, TestType } from '@/test';

export class CoverModifier extends StatusLevelModifier {
	async prepareTest<TTest extends ITest>(test: TTest): Promise<void> {
		if (!test.data.pool) {
			ui.notifications.error('wtf');
			throw `Modifying atest without a pool?`;
		}

		switch (test.type) {
			case TestType.RangedDefense:
				switch (this.level) {
					case 1:
						test.data.pool += 1;
						break;
					case 2:
						test.data.pool += 2;
						break;
					case 3:
						test.data.pool += 3;
						break;
					case 4:
						test.data.pool += 4;
						break;
					default:
						ui.notifications.error(`Invalid modifier level for this status effect ${this.name}`);
						throw `Invalid modifier level for this status effect ${this.name}`;
				}

				break;
			case TestType.RangedAttack:
				switch (this.level) {
					case 4:
						test.data.pool -= 2;
						break;
					default:
						ui.notifications.error(`Invalid modifier level for this status effect ${this.name}`);
						throw `Invalid modifier level for this status effect ${this.name}`;
				}
				break;
		}
	}

	async prepareOpposedTest<TTest extends ITest>(_test: TTest): Promise<void> {
		// TODO:
		ui.notifications.warn('A target is under cover by cover defense rating modifiers arnt implemented');
	}

	constructor({ parent, source, target, conditions, data }: ModifierConstructorData<StatusLevelModifierSourceData>) {
		data.class = 'CoverModifier';
		data.testClasses = data.testClasses || ['RangedAttackTest', 'RangedDefenseTest'];

		super({ parent, source, target, conditions, data });
	}
}
