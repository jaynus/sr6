import { MonitorDataModel } from '@/actor/data/MonitorsDataModel';
import { InitiativeType } from '@/data';
import { AvailableActions } from '@/data/interfaces';
import { MatrixSimType } from '@/data/matrix';
import { AdjustableMatrixAttributesDataModel } from '@/data/MatrixAttributesDataModel';
import BaseItemDataModel from '@/item/data/BaseItemDataModel';
import GearDataModel from '@/item/data/gear/GearDataModel';
import MatrixICDataModel from '@/item/data/MatrixICDataModel';

import SR6Item from '@/item/SR6Item';
import { IModifier, ModifierTarget } from '@/modifier';
import { PoolModifier } from '@/modifier/TestModifiers';
import { InitiativeRollData } from '@/roll/InitiativeRoll';
import { ITest } from '@/test';
import { getItemSync } from '@/util';

export enum PersonaType {
	Device = 'device',
	Living = 'living',
	IC = 'ic',
}

/*
let actor = game.actors.getName("ic");
let item = actor.createEmbeddedDocuments('Item', [{
    name: 'persona',
    type: 'matrix_persona',
	system: {
		type: 'ic'
	}
}]);


 */

type MatrixPersonaFormulasData = {
	attackRating: string;
	defenseRating: string;
};

export default abstract class MatrixPersonaDataModel extends BaseItemDataModel {
	abstract overwatchScore: MonitorDataModel;
	abstract noise: MonitorDataModel;

	abstract sourceDeviceId: null | ItemUUID;
	abstract attributes: AdjustableMatrixAttributesDataModel;
	abstract formulas: MatrixPersonaFormulasData;
	abstract type: PersonaType;
	protected abstract _simType: MatrixSimType;

	setOverwatch(value: number): void {
		if (value > this.overwatchScore.max) {
			value = this.overwatchScore.max;
		}
		if (value < 0) {
			value = 0;
		}

		this.overwatchScore.damage = value;
	}

	setNoise(value: number): void {
		if (value > this.noise.max) {
			value = this.noise.max;
		}
		if (value < 0) {
			value = 0;
		}

		this.noise.damage = value;
	}

	// IHasInitiative
	hasInitiativeType(type: InitiativeType): boolean {
		return type === InitiativeType.Matrix;
	}
	getInitiative(type: InitiativeType): null | InitiativeRollData {
		if (type !== InitiativeType.Matrix) {
			return null;
		}
		switch (this.simType) {
			case MatrixSimType.AR:
				return {
					score: this.solveFormula('@reaction + @intuition'),
					dice: 0,
				};
			case MatrixSimType.VRCold:
				return {
					score: this.solveFormula('@intuition + @persona.d'),
					dice: 1,
				};
			case MatrixSimType.VRHot:
				return {
					score: this.solveFormula('@intuition + @persona.d'),
					dice: 2,
				};
		}
	}

	getAvailableActions(_type: InitiativeType): AvailableActions {
		console.warn('TODO getAvailableActions');
		return {
			major: 1,
			minor: 1,
		};
	}

	get simType(): MatrixSimType {
		return this._simType;
	}

	set simType(simType: MatrixSimType) {
		// Swap initiative for sim type
		this._simType = simType;
		// TODO:
	}

	get sourceDevice(): null | SR6Item<GearDataModel> {
		if (this.sourceDeviceId) {
			const device = getItemSync(SR6Item<GearDataModel>, this.sourceDeviceId);
			if (device) {
				return device;
			}
		}
		return null;
	}

	get a(): number {
		return this.attributes.current.attack;
	}

	get s(): number {
		return this.attributes.current.sleaze;
	}

	get d(): number {
		return this.attributes.current.dataProcessing;
	}

	get f(): number {
		return this.attributes.current.firewall;
	}

	get attackRating(): number {
		return this.actor!.solveFormula(this.formulas.attackRating);
	}

	get baseDefenseRating(): number {
		return this.actor!.solveFormula(this.formulas.defenseRating);
	}

	defenseRating(_test: Maybe<ITest> = null): number {
		return this.baseDefenseRating;
	}

	monitor(item: Maybe<SR6Item> = null): Maybe<MonitorDataModel> {
		switch (this.type) {
			case PersonaType.Device: {
				return item
					? (item as SR6Item<GearDataModel>).systemData.monitors.matrix
					: this.sourceDevice?.systemData.monitors.matrix;
			}
			case PersonaType.Living: {
				return this.actor!.systemData.monitors.stun;
			}
			case PersonaType.IC: {
				return (item as SR6Item<MatrixICDataModel>).systemData.monitor;
			}
		}
	}

	get woundModifier(): number {
		if (!this.sourceDevice) {
			return 0;
		}
		const modifier = this.sourceDevice?.systemData.monitors.matrix?.woundModifier;
		return modifier ? modifier : 0;
	}

	override getRollData(): Record<string, unknown> {
		return {
			...super.getRollData(),
			...this.attributes.getRollData(),
			persona: {
				type: this.type,
				simType: this.simType,
				...this.attributes.getRollData(),
			},
		};
	}

	prepareNoiseModifier(): void {
		if (!this.actor!.modifiers) {
			return;
		}

		let noiseModifier = this.actor!.modifiers.all.find(
			(modifier) =>
				modifier.class === 'PoolModifier' && modifier.data.name === 'SR6.Modifiers.NoiseModifier.Name',
		) as PoolModifier | undefined;
		if (!noiseModifier && this.noise.damage > 0) {
			// Create it
			noiseModifier = new PoolModifier({
				parent: this.actor!,
				source: this.item!,
				target: ModifierTarget.Item,
				data: {
					name: 'SR6.Modifiers.NoiseModifier.Name',
					testClasses: ['MatrixActionTest', 'MatrixDefenseTest'],
					value: -this.noise.damage,
				},
			});
			this.actor!.modifiers.all.push(noiseModifier as unknown as IModifier);
		} else if (noiseModifier && this.noise.damage === 0) {
			// Remove it
			this.actor!.modifiers.all = this.actor!.modifiers.all.filter((m) => m !== noiseModifier);
		} else {
			// Update it
			if (noiseModifier) {
				noiseModifier.data.value = -this.noise.damage;
			}
		}
	}

	override prepareBaseData(): void {
		super.prepareBaseData();
		this.attributes.prepareBaseData();
	}

	override prepareData(): void {
		super.prepareData();
		this.attributes.prepareData();
	}

	override prepareDerivedData(): void {
		super.prepareDerivedData();
		this.attributes.prepareDerivedData();
		this.prepareNoiseModifier();
	}

	static override defineSchema(): foundry.data.fields.DataSchema {
		const fields = foundry.data.fields;

		return {
			...super.defineSchema(),
			overwatchScore: new fields.EmbeddedDataField(MonitorDataModel, {
				initial: { damage: 0, max: 40, formula: null },
				required: true,
				nullable: false,
			}),
			noise: new fields.EmbeddedDataField(MonitorDataModel, {
				initial: { damage: 0, max: 8, formula: null },
				required: true,
				nullable: false,
			}),

			sourceDeviceId: new fields.StringField({
				initial: null,
				nullable: true,
				required: true,
				blank: false,
			}),
			attributes: new fields.EmbeddedDataField(AdjustableMatrixAttributesDataModel, {
				nullable: false,
				required: true,
			}),
			formulas: new fields.SchemaField(
				{
					attackRating: new fields.StringField({
						initial: '@persona.a + @persona.s',
						required: true,
						nullable: false,
					}),
					defenseRating: new fields.StringField({
						initial: '@persona.d + @persona.f',
						required: true,
						nullable: false,
					}),
				},
				{ required: true, nullable: false },
			),
			_simType: new fields.StringField({
				initial: MatrixSimType.AR,
				required: true,
				nullable: false,
				blank: false,
				choices: Object.values(MatrixSimType),
			}),
			type: new fields.StringField({
				initial: PersonaType.Device,
				required: true,
				nullable: false,
				blank: false,
				choices: Object.values(PersonaType),
			}),
		};
	}
}
