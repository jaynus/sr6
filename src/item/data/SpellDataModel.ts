import LifeformDataModel from '@/actor/data/LifeformDataModel';
import SR6Actor from '@/actor/SR6Actor';
import { DamageType, DamageForm, Duration, RangeType } from '@/data';
import { SpellCombatType, SpellType, SpellAdjustmentType, SpellAdjustments } from '@/data/magic';
import BaseItemDataModel from '@/item/data/BaseItemDataModel';

export type SpellRangeData = {
	type: RangeType;
	value: number;
};

export type SpellDurationData = {
	type: Duration;
	value: number;
};

export type SpellDamageData = {
	combat: SpellCombatType;
	type: DamageType;
	form: DamageForm;
};

export type SpellFormulaData = {
	drain: string;
	damage: string;
	defend: string;
	soak: string;
};

export function drainFromSpellAdjustments(adjustments: SpellAdjustments): number {
	return adjustments[SpellAdjustmentType.AmpUp] * 2 + adjustments[SpellAdjustmentType.IncreaseArea];
}

export function damageFromSpellAdjustments(adjustments: SpellAdjustments): number {
	return adjustments[SpellAdjustmentType.AmpUp];
}

export default abstract class SpellDataModel extends BaseItemDataModel {
	abstract formulas: SpellFormulaData;
	abstract type: SpellType;
	abstract range: SpellRangeData;
	abstract duration: SpellDurationData;
	abstract damage: SpellDamageData;

	get pool(): number {
		return this.solveFormula('@magic + @spellcasting');
	}

	get drain(): number {
		if (this.formulas.drain) {
			return this.solveFormula(this.formulas.drain);
		}
		return 0;
	}

	get baseDamage(): number {
		if (this.formulas.damage) {
			return this.solveFormula(this.formulas.damage);
		} else {
			switch (this.damage.combat) {
				case SpellCombatType.Direct:
					return 0;
				case SpellCombatType.Indirect:
					return this.solveFormula('ceil(@magic / 2)');
			}
		}
	}

	get canDefend(): boolean {
		return this.damage !== null;
	}

	get canSoak(): boolean {
		if (!this.damage) {
			return false;
		}
		switch (this.damage.combat) {
			case SpellCombatType.Direct:
				return false;
			case SpellCombatType.Indirect:
				return true;
		}
	}

	getSoakPool(actor: SR6Actor<LifeformDataModel>): number {
		if (!this.formulas.soak && !this.damage) {
			ui.notifications.error('Called getSoakPool on a spell without a combat type and no formula?');
			return 0;
		}

		if (this.formulas.soak) {
			return this.item!.solveFormula(this.formulas.soak!, actor);
		} else {
			switch (this.damage.combat) {
				case SpellCombatType.Direct:
					ui.notifications.error('Called getSoakPool on a direct combat spell, cant soak');
					return 0;
				case SpellCombatType.Indirect:
					return this.item!.solveFormula('@body', actor);
			}
		}
	}

	getDefensePool(actor: SR6Actor<LifeformDataModel>): number {
		if (!this.formulas.defend && !this.damage) {
			ui.notifications.error('Called getDefensePool on a spell without a combat type and no formula?');
			return 0;
		}

		if (this.formulas.defend) {
			return this.item!.solveFormula(this.formulas.defend!, actor);
		} else {
			switch (this.damage.combat) {
				case SpellCombatType.Direct:
					return this.item!.solveFormula('@willpower + @intuition', actor);
				case SpellCombatType.Indirect:
					return this.item!.solveFormula('@willpower + @reaction', actor);
			}
		}
	}

	getDamage(attack: Record<string, unknown> = {}, defend: Record<string, unknown> = {}): number {
		switch (this.damage.combat) {
			case SpellCombatType.Direct:
				return (attack.hits ? (attack.hits as number) : 0) - (defend.hits ? (defend.hits as number) : 0);
			case SpellCombatType.Indirect:
				return this.solveFormula('ceil(@magic / 2)') - (defend.hits ? (defend.hits as number) : 0);
		}
	}

	getAttackRating(_data: Record<string, unknown> = {}): number {
		// TODO:
		return 69;
	}

	static override defineSchema(): foundry.data.fields.DataSchema {
		const fields = foundry.data.fields;
		return {
			...super.defineSchema(),
			type: new fields.StringField({
				initial: SpellType.Mana,
				required: true,
				nullable: false,
				blank: false,
				choices: Object.values(SpellType),
			}),
			formulas: new fields.SchemaField(
				{
					damage: new fields.StringField({
						initial: null,
						required: true,
						nullable: true,
						blank: false,
					}),
					drain: new fields.StringField({
						initial: null,
						required: true,
						nullable: true,
						blank: false,
					}),
					defend: new fields.StringField({
						initial: null,
						required: true,
						nullable: true,
						blank: false,
					}),
					soak: new fields.StringField({
						initial: null,
						required: true,
						nullable: true,
						blank: false,
					}),
				},
				{ required: true, nullable: false },
			),
			range: new fields.SchemaField(
				{
					type: new fields.StringField({
						initial: RangeType.Touch,
						required: true,
						nullable: false,
						blank: false,
						choices: Object.values(RangeType),
					}),
					value: new fields.NumberField({ initial: 1, required: false, nullable: false, integer: true }),
				},
				{ required: true, nullable: false },
			),
			duration: new fields.SchemaField(
				{
					type: new fields.StringField({
						initial: Duration.Instantaneous,
						required: true,
						nullable: false,
						blank: false,
						choices: Object.values(Duration),
					}),
					value: new fields.NumberField({ initial: 1, required: false, nullable: false, integer: true }),
				},
				{ required: true, nullable: false },
			),
			damage: new fields.SchemaField(
				{
					combat: new fields.StringField({
						initial: SpellCombatType.Direct,
						required: true,
						nullable: false,
						blank: false,
						choices: Object.values(SpellCombatType),
					}),
					type: new fields.StringField({
						initial: DamageType.Physical,
						required: true,
						nullable: false,
						blank: false,
						choices: Object.values(DamageType),
					}),
					form: new fields.StringField({
						initial: DamageForm.Force,
						required: true,
						nullable: false,
						blank: false,
						choices: Object.values(DamageForm),
					}),
				},
				{ required: true, nullable: true },
			),
		};
	}
}
