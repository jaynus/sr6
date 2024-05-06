import BaseActorDataModel from '@/actor/data/BaseActorDataModel';
import LifeformDataModel from '@/actor/data/LifeformDataModel';
import SR6Actor from '@/actor/SR6Actor';
import BaseDataModel from '@/data/BaseDataModel';
import { DocumentUUIDField } from '@/data/fields';
import { IHasMatrix, IHasOnDropActor } from '@/data/interfaces';
import SkillUseDataModel from '@/data/SkillUseDataModel';
import BaseItemDataModel from '@/item/data/BaseItemDataModel';
import { GearAvailabilityDataModel, GearMatrixDataModel } from '@/item/data/gear/GearDataModel';
import SR6Item from '@/item/SR6Item';
import { getActorSync } from '@/util';

export type Handling = {
	onRoad: number;
	offRoad: number;
};

export type Seats = {
	front: number;
	back: number;
};

export enum PilotType {
	Physical = 'physical',
	Rigged = 'rigged',
}

export enum VehicleTravelType {
	Ground = 'ground',
	Air = 'air',
	Water = 'water',
}

export abstract class VehiclePilotDataModel extends BaseDataModel {
	abstract actorId: Maybe<ActorUUID>;
	abstract type: Maybe<PilotType>;

	static defineSchema(): foundry.data.fields.DataSchema {
		const fields = foundry.data.fields;

		return {
			actorId: new DocumentUUIDField({ nullable: true, required: false }),
			type: new fields.StringField({
				initial: PilotType.Physical,
				required: false,
				nullable: true,
				blank: false,
				choices: Object.values(PilotType),
			}),
		};
	}
}

export abstract class VehicleStatusDataModel extends BaseDataModel {
	abstract speed: number;
	abstract acceleration: number;

	abstract pilot: Maybe<VehiclePilotDataModel>;
	abstract occupants: ActorUUID[];

	static defineSchema(): foundry.data.fields.DataSchema {
		const fields = foundry.data.fields;

		return {
			speed: new fields.NumberField({
				initial: 0,
				nullable: false,
				required: true,
				integer: true,
			}),
			acceleration: new fields.NumberField({
				initial: 0,
				nullable: false,
				required: true,
				integer: true,
			}),
			pilot: new fields.EmbeddedDataField(VehiclePilotDataModel, { nullable: true, required: false }),
			occupants: new fields.ArrayField(new DocumentUUIDField(), {
				initial: [],
				required: true,
				nullable: false,
			}),
		};
	}
}

type VehicleStatsData = {
	acceleration: number;
	speedInterval: number;
	maxSpeed: number;

	body: number;
	armor: number;

	pilot: number;
	sensor: number;
};

export abstract class BaseVehicleDataModel extends BaseActorDataModel implements IHasMatrix {
	abstract costFormula: string;
	abstract availability: GearAvailabilityDataModel;
	abstract handling: Handling;

	abstract stats: VehicleStatsData;

	abstract current: VehicleStatusDataModel;
	abstract matrix: Maybe<GearMatrixDataModel>;

	abstract skillUse: SkillUseDataModel;

	// IHasMatrix
	matrixIcon(): Maybe<string> {
		return this.actor?.img;
	}

	matrixWirelessActive(): boolean {
		return this.matrix !== null;
	}

	matrixRunningSilent(): boolean {
		// TODO:
		return false;
	}

	get cost(): number {
		return this.solveFormula(this.costFormula);
	}

	get pilot(): Maybe<SR6Actor> {
		const actorId = this.current.pilot?.actorId;
		if (!actorId) {
			return null;
		}

		return getActorSync(SR6Actor, actorId);
	}

	get occupants(): SR6Actor[] {
		return (
			this.current.occupants
				.map((actorId) => getActorSync(SR6Actor, actorId))
				.filter((a) => a !== null)
				.map((a) => a as SR6Actor) || []
		);
	}

	get pilotPool(): number {
		const skillUse = this.pilotSkillUse;

		return skillUse ? skillUse.pool : 0;
	}

	get pilotSkillUse(): Maybe<SkillUseDataModel> {
		return this.pilot
			? new SkillUseDataModel(
					{
						skill: this.skillUse.skill,
						specialization: this.skillUse.specialization,
						attribute: this.skillUse.attribute,
					},
					{ parent: this.pilot },
				)
			: null;
	}

	get speedPoolModifier(): number {
		return -Math.floor(this.current.speed / this.stats.speedInterval);
	}

	async setPilot(actor: Maybe<SR6Actor>): Promise<void> {
		await this.actor!.update({
			['system.current.pilot']: actor
				? {
						type: PilotType.Physical,
						actorId: actor.uuid,
					}
				: null,
		});
	}

	async addOccupant(actor: Maybe<SR6Actor>): Promise<void> {
		if (actor?.uuid) {
			this.current.occupants.push(actor.uuid);
			await this.actor!.update({ ['system.current.occupants']: this.current.occupants });
		}
	}

	async removeOccupant(actor: Maybe<SR6Actor>): Promise<void> {
		if (actor?.uuid) {
			if (this.current.occupants.indexOf(actor.uuid) > -1) {
				this.current.occupants.splice(this.current.occupants.indexOf(actor.uuid), 1);
				await this.actor!.update({ ['system.current.occupants']: this.current.occupants });
			}
		}
	}

	async setAcceleration(newAcceleration: number): Promise<number> {
		if (newAcceleration > this.stats.acceleration) {
			ui.notifications.warn(`New acceleration higher than max, adjusting ${this.stats.acceleration}`);
			newAcceleration = this.stats.acceleration;
		}
		if (newAcceleration < -this.stats.acceleration) {
			ui.notifications.warn(`New acceleration higher than max, adjusting ${this.stats.acceleration}`);
			newAcceleration = -this.stats.acceleration;
		}
		this.current.acceleration = newAcceleration;
		await this.actor!.update({ ['system.current.acceleration']: newAcceleration });

		return this.current.speed;
	}

	async setSpeed(newSpeed: number): Promise<number> {
		this.current.speed = Math.max(-this.stats.maxSpeed, Math.min(this.stats.maxSpeed, newSpeed));
		await this.actor!.update({ ['system.current.speed']: this.current.speed });

		return this.current.speed;
	}

	async nextRound(): Promise<void> {
		await this.setSpeed(this.current.speed + this.current.acceleration);
	}

	async resetSpeed(): Promise<void> {
		await this.setSpeed(0);
		await this.setAcceleration(0);
	}

	static override defineSchema(): foundry.data.fields.DataSchema {
		const fields = foundry.data.fields;

		return {
			...super.defineSchema(),
			costFormula: new fields.StringField({ initial: '0', nullable: false, required: true, blank: false }),
			availability: new fields.EmbeddedDataField(GearAvailabilityDataModel, { nullable: false, required: true }),
			stats: new fields.SchemaField(
				{
					handling: new fields.SchemaField(
						{
							onRoad: new fields.NumberField({
								initial: 0,
								nullable: false,
								required: true,
								min: 0,
								integer: true,
							}),
							offRoad: new fields.NumberField({
								initial: 0,
								nullable: false,
								required: true,
								min: 0,
								integer: true,
							}),
						},
						{ nullable: false, required: true },
					),
					acceleration: new fields.NumberField({
						initial: 0,
						nullable: false,
						required: true,
						min: 0,
						integer: true,
					}),
					speedInterval: new fields.NumberField({
						initial: 0,
						nullable: false,
						required: true,
						min: 0,
						integer: true,
					}),
					maxSpeed: new fields.NumberField({
						initial: 0,
						nullable: false,
						required: true,
						min: 0,
						integer: true,
					}),
					body: new fields.NumberField({
						initial: 0,
						nullable: false,
						required: true,
						min: 0,
						integer: true,
					}),
					armor: new fields.NumberField({
						initial: 0,
						nullable: false,
						required: true,
						min: 0,
						integer: true,
					}),
					pilot: new fields.NumberField({
						initial: 0,
						nullable: false,
						required: true,
						min: 0,
						integer: true,
					}),
					sensor: new fields.NumberField({
						initial: 0,
						nullable: false,
						required: true,
						min: 0,
						integer: true,
					}),
				},
				{ required: true, nullable: false },
			),
			skillUse: new fields.EmbeddedDataField(SkillUseDataModel, {
				initial: {
					skill: 'piloting',
					attribute: 'reaction',
					specialization: null,
				},
				required: true,
				nullable: true,
			}),
			matrix: new fields.EmbeddedDataField(GearMatrixDataModel, { nullable: true, required: false }),
			current: new fields.EmbeddedDataField(VehicleStatusDataModel, { required: true, nullable: true }),
		};
	}
}

export default abstract class VehicleDataModel
	extends BaseVehicleDataModel
	implements IHasOnDropActor<LifeformDataModel>
{
	abstract seats: Seats;

	async onDropActor(
		_event: ElementDragEvent,
		_data: DropCanvasData<'Actor', SR6Actor<LifeformDataModel>>,
	): Promise<false | void> {
		// if (this.occupants) {
		// }
		return false;
	}

	async onDropItem(
		_event: DragEvent,
		_data: DropCanvasData<'Item', SR6Item<BaseItemDataModel>>,
	): Promise<SR6Item<BaseItemDataModel>[] | boolean> {
		return false;
	}

	static override defineSchema(): foundry.data.fields.DataSchema {
		const fields = foundry.data.fields;

		return {
			...super.defineSchema(),

			seats: new fields.SchemaField(
				{
					front: new fields.NumberField({
						nullable: false,
						required: true,
						min: 0,
						integer: true,
						initial: 2,
					}),
					back: new fields.NumberField({
						nullable: false,
						required: true,
						min: 0,
						integer: true,
						initial: 2,
					}),
				},
				{ nullable: false, required: true },
			),
		};
	}
}
