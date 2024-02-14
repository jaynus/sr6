import { ITest } from '@/test/index.js';
import { ModifierConstructorData, ModifierSourceData } from '@/modifier/index.js';
import { TestModifier, TestModifierSourceData } from '@/modifier/TestModifiers.js';

export interface PainEditorModifierSourceData extends TestModifierSourceData {
	value?: number;
	offset?: number;
}

export class PainEditorModifier extends TestModifier<PainEditorModifierSourceData> {
	get value(): number {
		return this.data!.value || 0;
	}

	get offset(): number {
		return this.data!.offset || 0;
	}

	override isApplicable(test: Maybe<ITest> = null, _roll: Maybe<Roll> = null): boolean {
		if (super.isApplicable(test, _roll)) {
			if (test?.actor) {
				if (test.actor.systemData.monitors.woundModifier !== 0) {
					return true;
				}
			}
			return false;
		}

		return false;
	}

	async prepareTest<TTest extends ITest>(test: TTest): Promise<void> {
		if (test.data.pool) {
			const woundModifier = test.actor.systemData.monitors.woundModifier;

			if (!this.value && !this.offset) {
				test.data.pool += woundModifier;
			} else {
				if (this.value) {
					// Remove up to value wound modifiers
					test.data.pool += Math.max(this.value, woundModifier);
				} else if (this.offset) {
					// recalculate the modifier offset
					const physicalModifier = -Math.floor(
						test.actor.systemData.monitors.physical.damage / (3 + this.offset),
					);
					const stunModifier = -Math.floor(test.actor.systemData.monitors.stun.damage / (3 + this.offset));

					// cancel the wound modifiers
					test.data.pool += woundModifier;

					// Apply ours
					test.data.pool += physicalModifier + stunModifier;
				}
			}
		}
	}

	override toJSON(): ModifierSourceData {
		return {
			...super.toJSON(),
			value: this.value,
			offset: this.offset,
		};
	}

	constructor({ parent, source, conditions, target, data }: ModifierConstructorData<PainEditorModifierSourceData>) {
		data.class = 'PainEditorModifier';
		data.name = data.name || game.i18n.localize('SR6.Modifiers.PainEditorModifier.Name');
		data.description = data.description || game.i18n.localize('SR6.Modifiers.PainEditorModifier.Description');

		super({ parent, source, conditions, target, data });
	}
}
