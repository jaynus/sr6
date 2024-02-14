import BaseActorDataModel from '@/actor/data/BaseActorDataModel';
import { MonitorType } from '@/actor/data/MonitorsDataModel';
import SR6Actor from '@/actor/SR6Actor';
import SR6Item from '@/item/SR6Item';
import SR6Roll from '@/roll/SR6Roll';
import { ActivationPhase } from '@/data';
import EdgeActionDataModel from '@/item/data/action/EdgeActionDataModel';
import { InitiativeRollData } from '@/roll/InitiativeRoll';
import { EdgeModificationData, emit as socketEmit, SOCKET_NAME, SocketOperation, SocketPayload } from '@/socket';
import { ITest } from '@/test';
import { ConstructorOf, getActor } from '@/util';
import { DialogPrompt } from '@/app/DialogPrompt';

export enum EdgeCategory {
	general = 'general',
	matrix = 'matrix',
}

export enum EdgeBoostType {
	Action = 'Action',

	// 1 edge
	RerollOne = 'RerollOne',
	AddInitiative = 'AddInitiative',

	// 2 edge
	PlusOneSingleDice = 'PlusOneSingleDice',
	GrantAllyEdge = 'GrantAllyEdge',
	NegateFoeEdge = 'NegateFoeEdge',

	// 3 edge
	BuyHit = 'BuyHit',
	HealOneStun = 'HealOneStun',

	// 4 edge
	AddEdgeExplode = 'AddEdgeExplode',
	RerollFailures = 'RerollFailures',
	HealOnePhysical = 'HealOnePhysical',

	// 5 edge
	CountTwoGlitchesOpposed = 'CountTwoGlitchesOpposed',
	CreateSpecialEffect = 'CreateSpecialEffect',
}

export interface IEdgeBoost {
	type: EdgeBoostType;
	category: EdgeCategory;
	phase: ActivationPhase;
	edgeCost: number;

	get cost(): number;

	get name(): string;
	get description(): string;

	isApplicable(test: Maybe<ITest>): boolean;

	prepareInitiative?(data: InitiativeRollData): Promise<void>;

	prepareRoll?(roll: SR6Roll): Promise<void>;
	finishRoll?(roll: SR6Roll): Promise<void>;

	prepareActor?(actor: SR6Actor<BaseActorDataModel>): Promise<void>;
	finishActor?(actor: SR6Actor<BaseActorDataModel>): Promise<void>;

	prepareTest?(test: ITest): Promise<void>;
	finishTest?(test: ITest): Promise<void>;

	toJSON(): EdgeBoostJSON;
}

export type EdgeBoostJSON = {
	type: EdgeBoostType;
	data?: Record<string, unknown>;
};

export abstract class BaseEdgeBoost {
	abstract edgeCost: number;
	abstract category: EdgeCategory;

	get cost(): number {
		return this.edgeCost;
	}

	get name(): string {
		return game.i18n.localize(`SR6.Edge.Boosts.${(this as unknown as IEdgeBoost).type}.Name`);
	}

	get description(): string {
		return game.i18n.localize(`SR6.Edge.Boosts.${(this as unknown as IEdgeBoost).type}.Description`);
	}

	isApplicable(_test: Maybe<ITest>): boolean {
		return true;
	}

	async prepareActor(_actor: SR6Actor<BaseActorDataModel>): Promise<void> {
		// TODO: spend edge
	}

	toJSON(): EdgeBoostJSON {
		return {
			type: (this as unknown as IEdgeBoost).type,
		};
	}
}

/* 1-Cost Boosts */
export class AddInitiative extends BaseEdgeBoost implements IEdgeBoost {
	category: EdgeCategory = EdgeCategory.general;
	type: EdgeBoostType = EdgeBoostType.AddInitiative;
	phase: ActivationPhase = ActivationPhase.Initiative;
	edgeCost: number = 1;

	async prepareInitiative(data: InitiativeRollData): Promise<void> {
		data.score += 3;
	}
}

export class RerollOne extends BaseEdgeBoost implements IEdgeBoost {
	category: EdgeCategory = EdgeCategory.general;
	type: EdgeBoostType = EdgeBoostType.RerollOne;
	phase: ActivationPhase = ActivationPhase.PostRoll;
	edgeCost: number = 1;

	async finishRoll?(roll: SR6Roll): Promise<void> {
		await roll.rerollOne();
	}
}

/* 2-Cost Boosts */
export class PlusOneSingleDice extends BaseEdgeBoost implements IEdgeBoost {
	category: EdgeCategory = EdgeCategory.general;
	type: EdgeBoostType = EdgeBoostType.PlusOneSingleDice;
	phase: ActivationPhase = ActivationPhase.PostRoll;
	edgeCost: number = 2;

	async finishRoll(roll: SR6Roll): Promise<void> {
		roll.addOne();
	}
}

import VueSelectActorPrompt from '@/vue/apps/SelectActorPrompt.vue';
export class GrantAllyEdge extends BaseEdgeBoost implements IEdgeBoost {
	category: EdgeCategory = EdgeCategory.general;
	type: EdgeBoostType = EdgeBoostType.GrantAllyEdge;
	phase: ActivationPhase = ActivationPhase.Any;
	edgeCost: number = 2;

	async finishActor(actor: SR6Actor<BaseActorDataModel>): Promise<void> {
		const selectedActor = await DialogPrompt.prompt<SR6Actor, { self: SR6Actor }>(
			VueSelectActorPrompt,
			{ self: actor },
			{
				classes: ['app-select-actor-prompt'],
				title: 'Select Actor',
			},
		);
		if (selectedActor) {
			if (!selectedActor.isOwner) {
				socketEmit(SocketOperation.EdgeModificationData, {
					sourceActorId: actor.uuid,
					targetActorId: selectedActor.uuid,
					value: 1,
				});
			} else {
				await selectedActor.systemData.monitors.gainEdge(1);
			}
		}
	}
}

export class NegateFoeEdge extends BaseEdgeBoost implements IEdgeBoost {
	category: EdgeCategory = EdgeCategory.general;
	type: EdgeBoostType = EdgeBoostType.NegateFoeEdge;
	phase: ActivationPhase = ActivationPhase.Any;
	edgeCost: number = 2;

	async finishActor(actor: SR6Actor<BaseActorDataModel>): Promise<void> {
		const selectedActor = await DialogPrompt.prompt<SR6Actor, { self: SR6Actor }>(
			VueSelectActorPrompt,
			{ self: actor },
			{
				classes: ['app-select-actor-prompt'],
				title: 'Select Actor',
			},
		);
		if (selectedActor) {
			if (!selectedActor.isOwner) {
				socketEmit(SocketOperation.EdgeModificationData, {
					sourceActorId: actor.uuid,
					targetActorId: selectedActor.uuid,
					value: -1,
				});
			} else {
				await selectedActor.systemData.monitors.spendEdge(1);
			}
		}
	}
}

/* 3-Cost Boosts */
export class BuyHit extends BaseEdgeBoost implements IEdgeBoost {
	category: EdgeCategory = EdgeCategory.general;
	type: EdgeBoostType = EdgeBoostType.BuyHit;
	phase: ActivationPhase = ActivationPhase.Any;
	edgeCost: number = 3;

	async finishRoll(roll: SR6Roll): Promise<void> {
		roll.addDie();
	}
}
export class HealOneStun extends BaseEdgeBoost implements IEdgeBoost {
	category: EdgeCategory = EdgeCategory.general;
	type: EdgeBoostType = EdgeBoostType.HealOneStun;
	phase: ActivationPhase = ActivationPhase.Any;
	edgeCost: number = 4;

	async finishActor(actor: SR6Actor<BaseActorDataModel>): Promise<void> {
		void actor.systemData.monitors.applyHeal(MonitorType.Stun, 1);
	}
}

/* 4-Cost Boosts */
export class AddEdgeExplode extends BaseEdgeBoost implements IEdgeBoost {
	category: EdgeCategory = EdgeCategory.general;
	type: EdgeBoostType = EdgeBoostType.AddEdgeExplode;
	phase: ActivationPhase = ActivationPhase.PreRoll;
	edgeCost: number = 4;

	async prepareTest(test: ITest): Promise<void> {
		test.data.pool! += test.actor.systemData.monitors.edge.max;
	}

	async finishRoll(roll: SR6Roll): Promise<void> {
		await roll.explode();
	}
}

export class HealOnePhysical extends BaseEdgeBoost implements IEdgeBoost {
	category: EdgeCategory = EdgeCategory.general;
	type: EdgeBoostType = EdgeBoostType.HealOnePhysical;
	phase: ActivationPhase = ActivationPhase.Any;
	edgeCost: number = 4;

	async finishActor(actor: SR6Actor<BaseActorDataModel>): Promise<void> {
		await actor.systemData.monitors.applyHeal(MonitorType.Physical, 1);
	}
}

export class RerollFailures extends BaseEdgeBoost implements IEdgeBoost {
	category: EdgeCategory = EdgeCategory.general;
	type: EdgeBoostType = EdgeBoostType.RerollFailures;
	phase: ActivationPhase = ActivationPhase.PostRoll;
	edgeCost: number = 4;

	async finishRoll(roll: SR6Roll): Promise<void> {
		await roll.rerollFailed();
	}
}

// 5 edge actions
export class CountTwoGlitchesOpposed extends BaseEdgeBoost implements IEdgeBoost {
	category: EdgeCategory = EdgeCategory.general;
	type: EdgeBoostType = EdgeBoostType.CountTwoGlitchesOpposed;
	phase: ActivationPhase = ActivationPhase.PreRoll;
	edgeCost: number = 5;
}

// 5 edge actions
export class CreateSpecialEffect extends BaseEdgeBoost implements IEdgeBoost {
	category: EdgeCategory = EdgeCategory.general;
	type: EdgeBoostType = EdgeBoostType.CreateSpecialEffect;
	phase: ActivationPhase = ActivationPhase.Any;
	edgeCost: number = 5;
}

// TODO: Edge Action? Broken atm

export class EdgeActionBoost extends BaseEdgeBoost implements IEdgeBoost {
	category: EdgeCategory = EdgeCategory.general;
	type: EdgeBoostType = EdgeBoostType.Action;
	phase: ActivationPhase = ActivationPhase.PreRoll;
	edgeCost: number = 1;

	protected _edgeAction: Maybe<SR6Item<EdgeActionDataModel>> = null;

	override get name(): string {
		return this._edgeAction ? `Action ${this._edgeAction.name}` : 'Edge Action';
	}

	override get description(): string {
		return this._edgeAction ? this._edgeAction.systemData.description : '[No Description]';
	}

	get edgeAction(): Maybe<SR6Item<EdgeActionDataModel>> {
		return this._edgeAction;
	}

	set edgeAction(edgeAction: Maybe<SR6Item<EdgeActionDataModel>>) {
		this._edgeAction = edgeAction;
	}

	override isApplicable(test: Maybe<ITest>): boolean {
		if (!test || !this._edgeAction) {
			return true;
		}

		return this._edgeAction!.systemData.testClasses.includes(test!.type);
	}

	async prepareInitiative(data: InitiativeRollData): Promise<void> {
		await this.edgeAction?.systemData.prepareInitiative?.(data);
	}

	async prepareTest(test: ITest): Promise<void> {
		console.log('EdgeActionBoost', this);
		await this.edgeAction?.systemData.prepareTest?.(test);
	}

	async finishRoll(roll: SR6Roll): Promise<void> {
		await this.edgeAction?.systemData.finishRoll?.(roll);
	}

	override async prepareActor(actor: SR6Actor<BaseActorDataModel>): Promise<void> {
		await super.prepareActor(actor);
		await this.edgeAction?.systemData.prepareActor?.(actor);
	}

	async finishTest(test: ITest): Promise<void> {
		await this.edgeAction?.systemData.finishTest?.(test);
	}

	override get cost(): number {
		return this.edgeAction?.systemData.cost || 0;
	}

	override toJSON(): EdgeBoostJSON {
		return {
			type: this.type,
			data: {
				edgeAction: this.edgeAction?.uuid,
			},
		};
	}

	constructor(data?: Record<string, unknown>) {
		super();
		if (data && Object.prototype.hasOwnProperty.call(data, 'edgeAction') && data.edgeAction) {
			this._edgeAction = fromUuidSync(data.edgeAction as ItemUUID) as SR6Item<EdgeActionDataModel>;
		} else {
			this._edgeAction = undefined;
		}
	}
}

export function config(): Record<string, ConstructorOf<BaseEdgeBoost>> {
	return {
		[EdgeBoostType.Action]: EdgeActionBoost,

		[EdgeBoostType.RerollOne]: RerollOne,
		[EdgeBoostType.AddInitiative]: AddInitiative,
		[EdgeBoostType.PlusOneSingleDice]: PlusOneSingleDice,

		[EdgeBoostType.BuyHit]: BuyHit,
		[EdgeBoostType.HealOneStun]: HealOneStun,
		[EdgeBoostType.GrantAllyEdge]: GrantAllyEdge,
		[EdgeBoostType.NegateFoeEdge]: NegateFoeEdge,

		[EdgeBoostType.AddEdgeExplode]: AddEdgeExplode,
		[EdgeBoostType.RerollFailures]: RerollFailures,
		[EdgeBoostType.HealOnePhysical]: HealOnePhysical,

		[EdgeBoostType.CountTwoGlitchesOpposed]: CountTwoGlitchesOpposed,

		[EdgeBoostType.CreateSpecialEffect]: CreateSpecialEffect,
	};
}

export function getEdgeBoostFromJSON(json: string): IEdgeBoost {
	const data: EdgeBoostJSON = JSON.parse(json);
	return new (CONFIG.sr6.types.edge[data.type] as ConstructorOf<IEdgeBoost>)(data.data);
}

export function getEdgeBoost(data: EdgeBoostJSON): IEdgeBoost {
	return new (CONFIG.sr6.types.edge[data.type] as ConstructorOf<IEdgeBoost>)(data.data);
}

export function register(): void {
	game.socket.on(SOCKET_NAME, async (payload: SocketPayload<EdgeModificationData>) => {
		if (!payload.data) {
			return;
		}

		// Only process the message on GM
		if (!game.user!.isGM) {
			return;
		}

		const sourceActor = await getActor<SR6Actor<BaseActorDataModel>>(
			SR6Actor<BaseActorDataModel>,
			payload.data.sourceActorId,
		);
		const targetActor = await getActor<SR6Actor<BaseActorDataModel>>(
			SR6Actor<BaseActorDataModel>,
			payload.data.targetActorId,
		);

		if (!sourceActor || !targetActor) {
			const err = 'Got a wierd socket rrequest for edge modification';
			ui.notifications.warn(err);
			console.error(err, payload);
			return;
		}

		switch (payload.operation) {
			case SocketOperation.EdgeModificationData:
				if (
					await Dialog.confirm({
						title: 'Foreign Edge Modification Request',
						content: `${sourceActor.name} has requested modifying ${targetActor.name} edge, value = ${payload.data.value}`,
						yes: () => true,
						no: () => false,
						options: {
							classes: ['prompt-dialog'],
						},
					})
				) {
					if (payload.data.value > 0) {
						await targetActor.systemData.monitors.gainEdge(payload.data.value);
					} else {
						await targetActor.systemData.monitors.spendEdge(payload.data.value);
					}
				}

				break;
		}
	});
}
