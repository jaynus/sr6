import BaseActorDataModel from '@/actor/data/BaseActorDataModel';
import { MonitorDataModel } from '@/actor/data/MonitorsDataModel';
import SR6Combat from '@/combat/SR6Combat';
import SR6Combatant from '@/combat/SR6Combatant';
import { InitiativeType } from '@/data';
import { DocumentUUIDField } from '@/data/fields';
import { AvailableActions, IHasInitiative, IHasMatrix, IHasMatrixPersona, IHasPostCreate } from '@/data/interfaces';
import { AdjustableMatrixAttributesDataModel } from '@/data/MatrixAttributesDataModel';
import MatrixPersonaDataModel, { PersonaType } from '@/item/data/feature/MatrixPersonaDataModel';
import GearDataModel from '@/item/data/gear/GearDataModel';
import MatrixICDataModel from '@/item/data/MatrixICDataModel';
import SR6Item from '@/item/SR6Item';
import { InitiativeRollData } from '@/roll/InitiativeRoll';

export default abstract class MatrixHostDataModel
	extends BaseActorDataModel
	implements IHasMatrix, IHasMatrixPersona, IHasPostCreate, IHasInitiative
{
	abstract rating: number;
	abstract attributes: AdjustableMatrixAttributesDataModel;

	protected abstract _personas: (() => SR6Item<MatrixPersonaDataModel>)[];

	// IHasInitiative
	//
	hasInitiativeType(type: InitiativeType): boolean {
		return type === InitiativeType.Matrix;
	}

	getInitiative(type: InitiativeType): null | InitiativeRollData {
		if (type !== InitiativeType.Matrix) {
			return null;
		}
		const rollData = {
			score: this.rating,
			dice: 4,
		};

		if (rollData) {
			// Apply modifiers
			this.actor!.modifiers.getApplicable(null).forEach((modifier) => {
				if (modifier.prepareInitiative) {
					modifier.prepareInitiative(type, rollData, null);
				}
			});
		}

		return rollData;
	}

	getAvailableActions(type: InitiativeType): AvailableActions {
		if (type !== InitiativeType.Matrix) {
			return {
				major: 0,
				minor: 0,
			};
		}

		return {
			major: 2,
			minor: 0,
		};
	}

	// IHasMatrixPersona
	//
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

	// TODO: why did I have device here?
	async activateMatrixPersona(
		_device: SR6Item<GearDataModel> | null = null,
	): Promise<SR6Item<MatrixPersonaDataModel>> {
		return this.actor!.items.find((item) => item.type === 'matrix_persona')! as SR6Item<MatrixPersonaDataModel>;
	}

	async deactivateMatrixPersona(): Promise<boolean> {
		return false;
	}

	get programs(): SR6Item<MatrixICDataModel>[] {
		return this.actor!.items.filter((item) => item.type === 'matrix_ic').map(
			(item) => item as SR6Item<MatrixICDataModel>,
		);
	}

	override prepareDerivedData(): void {
		super.prepareDerivedData();
		this.attributes.prepareDerivedData();
	}

	override getRollData(): Record<string, unknown> {
		return {
			...super.getRollData(),
			persona: {
				...this.attributes.getRollData(),
				type: PersonaType.IC,
			},
		};
	}

	async onPostCreate(): Promise<void> {
		// Create our persona
		await this.actor!.createEmbeddedDocuments('Item', [
			{
				type: 'matrix_persona',
				name: `${this.actor!.name} persona`,
				system: {
					sourceDevice: null,
					attributes: this.attributes,
					type: PersonaType.IC,
				},
			},
		]);
	}

	static override defineSchema(): foundry.data.fields.DataSchema {
		const fields = foundry.data.fields;

		return {
			...super.defineSchema(),
			rating: new fields.NumberField({ initial: 1, min: 1, max: 20, nullable: false, required: true }),
			_personas: new fields.ArrayField(new DocumentUUIDField()),
			monitors: new fields.SchemaField({ edge: new fields.EmbeddedDataField(MonitorDataModel) }),
			attributes: new fields.EmbeddedDataField(AdjustableMatrixAttributesDataModel, {
				initial: {
					base: {
						attack: 0,
						sleaze: 0,
						dataProcessing: 0,
						firewall: 0,
						formulas: {
							attack: '@rating',
							sleaze: '@rating + 1',
							dataProcessing: '@rating + 2',
							firewall: '@rating + 3',
						},
					},
					current: {
						attack: 0,
						sleaze: 0,
						dataProcessing: 0,
						firewall: 0,
						formulas: null,
					},
				},
				nullable: false,
				required: true,
			}),
		};
	}
}
