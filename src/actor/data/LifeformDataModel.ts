import { EnumAttribute } from '@/actor/data';
import AttributeDataModel from '@/actor/data/AttributeDataModel';
import BaseActorDataModel from '@/actor/data/BaseActorDataModel';
import MonitorsDataModel from '@/actor/data/MonitorsDataModel';
import MonitorDataModel, { WoundModifierData } from '@/actor/data/MonitorsDataModel';
import SR6Combat from '@/combat/SR6Combat';
import SR6Combatant from '@/combat/SR6Combatant';
import { InitiativeType } from '@/data';
import InitiativeDataModel from '@/data/InitiativeDataModel';

import { AvailableActions, IHasEdge, IHasInitiative, IHasMatrix, IHasPostCreate } from '@/data/interfaces';
import { MAGIC_TRADITION_ATTRIBUTE, MagicAwakenedType, MagicTradition } from '@/data/magic';
import MatrixPersonaDataModel from '@/item/data/feature/MatrixPersonaDataModel';
import { InitiativeRollData } from '@/roll/InitiativeRoll';

/** s
 *
 * @author jaynus
 * @file Player Character
 */

export type Attributes = {
	body: AttributeDataModel;
	agility: AttributeDataModel;
	reaction: AttributeDataModel;
	strength: AttributeDataModel;
	willpower: AttributeDataModel;
	logic: AttributeDataModel;
	intuition: AttributeDataModel;
	charisma: AttributeDataModel;
	magic: AttributeDataModel;
	resonance: AttributeDataModel;
	essence: AttributeDataModel;
	edge: AttributeDataModel;
};

export type Monitors = {
	physical: MonitorDataModel;
	stun: MonitorDataModel;
	overflow: MonitorDataModel;
	edge: MonitorDataModel;
};

export type Initiatives = {
	physical: InitiativeDataModel;
	astral: null | InitiativeDataModel;
	matrix: null | InitiativeDataModel;
};

export default abstract class LifeformDataModel
	extends BaseActorDataModel
	implements IHasPostCreate, IHasInitiative, IHasEdge, IHasMatrix
{
	abstract attributes: Attributes;

	abstract initiatives: Initiatives;

	abstract magicAwakened: MagicAwakenedType;
	abstract magicTradition: MagicTradition;

	override get woundModifiers(): WoundModifierData {
		return {
			...super.woundModifiers,
			...this.monitors.woundModifiers,
		};
	}

	get spellAttackRating(): number {
		return this.solveFormula(`@magic + @${MAGIC_TRADITION_ATTRIBUTE[this.magicTradition]}`);
	}

	get spellDrainPool(): number {
		return this.solveFormula(`@willpower + @${MAGIC_TRADITION_ATTRIBUTE[this.magicTradition]}`);
	}

	get fadePool(): number {
		return this.solveFormula(`@willpower + @logic`);
	}

	get spellAmps(): number {
		return this.solveFormula(`max(@magic, @sorcery)`);
	}

	// IHasMatrixPersona
	get matrixPersona(): null | MatrixPersonaDataModel {
		return this._matrixPersona;
	}

	set matrixPersona(persona: null | MatrixPersonaDataModel) {
		this._matrixPersona = persona;
	}

	// IHasMatrix
	matrixIcon(): Maybe<string> {
		return this.actor?.img;
	}

	matrixWirelessActive(): boolean {
		return this.matrixPersona !== null;
	}

	matrixRunningSilent(): boolean {
		// TODO:
		return false;
	}

	//
	// IHasInitiative
	//
	hasInitiativeType(type: InitiativeType): boolean {
		switch (type) {
			case InitiativeType.Physical:
				return true;
			case InitiativeType.Astral:
				return false;
			case InitiativeType.Matrix: {
				return this.matrixPersona != null;
			}
		}
	}

	getInitiative(type: InitiativeType): null | InitiativeRollData {
		let result: null | InitiativeRollData = null;
		switch (type) {
			case InitiativeType.Physical:
				result = new InitiativeRollData(this.initiatives.physical);
				break;
			case InitiativeType.Astral:
				result = this.initiatives.astral ? new InitiativeRollData(this.initiatives.astral!) : null;
				break;
			case InitiativeType.Matrix: {
				if (!this.matrixPersona) {
					ui.notifications.error('No matrix persona activated for rolling initiative');
					return null;
				}
				result = this.matrixPersona.getInitiative(type);
				break;
			}
		}

		if (result) {
			// Apply modifiers
			this.actor!.modifiers.getApplicable(null).forEach((modifier) => {
				if (modifier.prepareInitiative) {
					modifier.prepareInitiative(type, result, null);
				}
			});
		}

		return result;
	}

	getAvailableActions(type: InitiativeType): AvailableActions {
		switch (type) {
			case InitiativeType.Physical:
				return this.initiatives.physical.availableActions;
			case InitiativeType.Astral:
				ui.notifications.error('astral actions not implemented');
				break;
			case InitiativeType.Matrix:
				if (!this.matrixPersona) {
					ui.notifications.error('No matrix persona activated for actions');
				} else {
					return this.matrixPersona!.getAvailableActions(type);
				}
		}

		return {
			major: 0,
			minor: 0,
		};
	}

	//
	// IHasEdge
	//
	async gainEdge(count: number): Promise<boolean> {
		return this.monitors.gainEdge(count);
	}

	async spendEdge(count: number): Promise<boolean> {
		return this.monitors.spendEdge(count);
	}

	attribute(id: EnumAttribute): AttributeDataModel {
		switch (id) {
			case EnumAttribute.body:
				return this.attributes.body;
			case EnumAttribute.agility:
				return this.attributes.agility;
			case EnumAttribute.reaction:
				return this.attributes.reaction;
			case EnumAttribute.strength:
				return this.attributes.strength;
			case EnumAttribute.willpower:
				return this.attributes.willpower;
			case EnumAttribute.logic:
				return this.attributes.logic;
			case EnumAttribute.intuition:
				return this.attributes.intuition;
			case EnumAttribute.charisma:
				return this.attributes.charisma;
			case EnumAttribute.magic:
				return this.attributes.magic;
			case EnumAttribute.resonance:
				return this.attributes.resonance;
			case EnumAttribute.edge:
				return this.attributes.edge;
			case EnumAttribute.essence:
				return this.attributes.essence;
		}
	}

	override prepareBaseData(): void {
		super.prepareBaseData();

		// if (this.actor!.isOwner) this.actor!.update({ ['system.attributes']: this.attributes });
		// if (this.actor!.isOwner) this.actor!.update({ ['system.monitors']: this.monitors });
		this._prepareAttributes(AttributeDataModel.prototype.prepareBaseData);
		this.monitors.prepareBaseData();
	}

	override prepareData(): void {
		super.prepareData();
		this._prepareAttributes(AttributeDataModel.prototype.prepareData);
		this.monitors.prepareData();
	}

	override prepareDerivedData(): void {
		super.prepareDerivedData();
		this._prepareAttributes(AttributeDataModel.prototype.prepareDerivedData);

		// Set our max edge to our edge attribute
		this.monitors.edge.max = this.attributes.edge.base;

		this.monitors.prepareDerivedData();
	}

	override getRollData(): Record<string, unknown> {
		return {
			...super.getRollData(),
			monitors: this.monitors.getRollData(),
			body: this.attributes.body.value,
			agility: this.attributes.agility.value,
			reaction: this.attributes.reaction.value,
			strength: this.attributes.strength.value,
			willpower: this.attributes.willpower.value,
			logic: this.attributes.logic.value,
			intuition: this.attributes.intuition.value,
			charisma: this.attributes.charisma.value,
			magic: this.attributes.magic.value,
			resonance: this.attributes.resonance.value,
			edge: this.attributes.edge.value,
			essence: this.attributes.essence.value,
		};
	}

	_prepareAttributes(fn: () => void): void {
		fn.call(this.attributes.body);
		fn.call(this.attributes.agility);
		fn.call(this.attributes.reaction);
		fn.call(this.attributes.strength);
		fn.call(this.attributes.willpower);
		fn.call(this.attributes.logic);
		fn.call(this.attributes.intuition);
		fn.call(this.attributes.charisma);
		fn.call(this.attributes.magic);
		fn.call(this.attributes.resonance);
		fn.call(this.attributes.edge);
		fn.call(this.attributes.essence);
	}

	async onPostCreate(): Promise<void> {
		await this.actor!.update({
			['prototypeToken']: {
				bar1: { attribute: 'monitors.physical' },
				bar2: { attribute: 'monitors.stun' },
				// displayName: CONST.TOKEN_DISPLAY_MODES.HOVER,
				// displayBars: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
				actorLink: true,
			},
		});
	}

	static override defineSchema(): foundry.data.fields.DataSchema {
		const fields = foundry.data.fields;

		return {
			...super.defineSchema(),
			initiatives: new fields.SchemaField(
				{
					physical: new fields.EmbeddedDataField(InitiativeDataModel, { required: true, nullable: false }),
					astral: new fields.EmbeddedDataField(InitiativeDataModel, { required: true, nullable: true }), // TODO initial
					matrix: new fields.EmbeddedDataField(InitiativeDataModel, { required: true, nullable: true }), // TODO: initial
				},
				{ required: true, nullable: false },
			),

			attributes: new fields.SchemaField({
				body: new fields.EmbeddedDataField(AttributeDataModel, {
					initial: { base: 2, value: 2, mod: 0, max: 6 },
					required: true,
					nullable: false,
				}),
				agility: new fields.EmbeddedDataField(AttributeDataModel, {
					initial: { base: 2, value: 2, mod: 0, max: 6 },
					required: true,
					nullable: false,
				}),
				reaction: new fields.EmbeddedDataField(AttributeDataModel, {
					initial: { base: 2, value: 2, mod: 0, max: 6 },
					required: true,
					nullable: false,
				}),
				strength: new fields.EmbeddedDataField(AttributeDataModel, {
					initial: { base: 2, value: 2, mod: 0, max: 6 },
					required: true,
					nullable: false,
				}),
				willpower: new fields.EmbeddedDataField(AttributeDataModel, {
					initial: { base: 2, value: 2, mod: 0, max: 6 },
					required: true,
					nullable: false,
				}),
				logic: new fields.EmbeddedDataField(AttributeDataModel, {
					initial: { base: 2, value: 2, mod: 0, max: 6 },
					required: true,
					nullable: false,
				}),
				intuition: new fields.EmbeddedDataField(AttributeDataModel, {
					initial: { base: 2, value: 2, mod: 0, max: 6 },
					required: true,
					nullable: false,
				}),
				charisma: new fields.EmbeddedDataField(AttributeDataModel, {
					initial: { base: 2, value: 2, mod: 0, max: 6 },
					required: true,
					nullable: false,
				}),
				magic: new fields.EmbeddedDataField(AttributeDataModel, {
					initial: { base: 0, value: 0, mod: 0, max: 6 },
					required: true,
					nullable: false,
				}),
				resonance: new fields.EmbeddedDataField(AttributeDataModel, {
					initial: { base: 0, value: 0, mod: 0, max: 6 },
					required: true,
					nullable: false,
				}),
				essence: new fields.EmbeddedDataField(AttributeDataModel, {
					initial: { base: 6, value: 0, mod: 0, max: 6 },
					required: true,
					nullable: false,
				}),
				edge: new fields.EmbeddedDataField(AttributeDataModel, {
					initial: { base: 1, value: 0, mod: 0, max: 10 },
					required: true,
					nullable: false,
				}),
			}),
			monitors: new fields.EmbeddedDataField(MonitorsDataModel, { required: true, nullable: false }),
			magicTradition: new fields.StringField({
				initial: null,
				nullable: true,
				required: true,
				blank: false,
				choices: Object.values(MagicTradition),
			}),
			magicAwakened: new fields.StringField({
				initial: MagicAwakenedType.Mundane,
				nullable: false,
				required: true,
				blank: false,
				choices: Object.values(MagicAwakenedType),
			}),
		};
	}
}
