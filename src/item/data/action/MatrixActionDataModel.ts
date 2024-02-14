/**
 *
 * @author jaynus
 * @file Basic data model
 */

import BaseActorDataModel from '@/actor/data/BaseActorDataModel';
import CharacterDataModel from '@/actor/data/CharacterDataModel';
import SR6Actor from '@/actor/SR6Actor';
import { DamageType } from '@/data';
import { MatrixAccessLevel, MatrixActionType, MatrixAttribute } from '@/data/matrix';
import SkillUseDataModel from '@/data/SkillUseDataModel';
import BaseActionDataModel from '@/item/data/action/BaseActionDataModel';

export type MatrixActionLimits = {
	illegal: boolean;
	access_level: MatrixAccessLevel[];
};

export type MatrixActionFormulas = {
	attack: null | string;
	attackRating: null | string;
	defend: null | string;
	deviceDefend: null | string;
	damage: null | string;
	soak: null | string;
};

export default abstract class MatrixActionDataModel extends BaseActionDataModel {
	abstract type: MatrixActionType;

	abstract skillUse: SkillUseDataModel | null;
	abstract linkedAttribute: string | null;
	abstract limits: MatrixActionLimits;

	abstract formulas: MatrixActionFormulas;

	abstract damage: {
		types: DamageType[];
	};

	get canDefend(): boolean {
		return this.formulas.defend !== null;
	}

	get canSoak(): boolean {
		return this.formulas.soak !== null;
	}

	get canDamage(): boolean {
		return this.formulas.damage !== null;
	}

	get pool(): number {
		if (this.skillUse) {
			return this.solveFormula(`@${this.skillUse!.attribute} + @${this.skillUse!.skill.toLowerCase()}`);
		} else if (this.formulas.attack) {
			return this.solveFormula(this.formulas.attack!);
		}

		return 0;
	}

	getDamage(data: Record<string, unknown> = {}): number {
		return this.formulas.damage ? this.solveFormula(this.formulas.damage!, data) : 0;
	}

	getAttackRating(data: Record<string, unknown> = {}): number {
		return this.formulas.attackRating ? this.solveFormula(this.formulas.attackRating!, data) : 0;
	}

	getSoakPool(actor: SR6Actor<BaseActorDataModel>, data: Record<string, unknown> = {}): number {
		if (!this.formulas.soak && !this.damage) {
			ui.notifications.error('Called getSoakPool on a spell without a combat type and no formula?');
			return 0;
		}

		if (this.formulas.soak) {
			return this.item!.solveFormula(this.formulas.soak!, actor, data);
		}

		return 0;
	}

	getDefensePool<TDataModel extends BaseActorDataModel = BaseActorDataModel>(
		defender: SR6Actor<TDataModel>,
		data: Record<string, unknown> = {},
	): number {
		const fuckme = defender;
		if (defender.systemData instanceof CharacterDataModel) {
			return this.formulas.defend ? defender.solveFormula(this.formulas.defend!, data) : 0;
		}
		return this.formulas.deviceDefend ? fuckme.solveFormula(this.formulas.deviceDefend!, data) : 0;
	}

	static override defineSchema(): foundry.data.fields.DataSchema {
		const fields = foundry.data.fields;
		return {
			...super.defineSchema(),
			type: new fields.StringField({
				initial: MatrixActionType.IC,
				required: true,
				nullable: false,
				blank: false,
				choices: Object.values(MatrixActionType),
			}),
			skillUse: new fields.EmbeddedDataField(SkillUseDataModel, {
				initial: null,
				required: true,
				nullable: true,
			}),
			linkedAttribute: new fields.StringField({
				initial: null,
				required: true,
				nullable: true,
				blank: false,
				choices: Object.values(MatrixAttribute),
			}),
			limits: new fields.SchemaField(
				{
					illegal: new fields.BooleanField({ initial: false, required: true, nullable: false }),
					accessLevel: new fields.ArrayField(
						new fields.StringField({
							initial: MatrixAccessLevel.Outsider,
							required: true,
							nullable: false,
							blank: false,
							choices: Object.values(MatrixAccessLevel),
						}),
						{
							required: true,
							nullable: false,
						},
					),
				},
				{ required: true, nullable: false },
			),
			damage: new fields.SchemaField(
				{
					types: new fields.ArrayField(
						new fields.StringField({
							required: true,
							nullable: false,
							blank: false,
							choices: [DamageType.Biofeedback, DamageType.Matrix, DamageType.Physical],
						}),
						{ initial: [DamageType.Matrix] },
					),
				},
				{ nullable: true, required: false },
			),
			formulas: new fields.SchemaField(
				{
					attackRating: new fields.StringField({
						initial: null,
						required: true,
						nullable: true,
						blank: false,
					}),
					attack: new fields.StringField({ initial: null, required: true, nullable: true, blank: false }),
					defend: new fields.StringField({ initial: null, required: true, nullable: true, blank: false }),
					deviceDefend: new fields.StringField({
						initial: null,
						required: true,
						nullable: true,
						blank: false,
					}),
					damage: new fields.StringField({ initial: null, required: true, nullable: true, blank: false }),
					soak: new fields.StringField({ initial: null, required: true, nullable: true, blank: false }),
				},
				{ required: true, nullable: false },
			),
		};
	}
}
