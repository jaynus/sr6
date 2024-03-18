/**
 *
 * @author jaynus
 * @file
 */

import SR6Actor from '@/actor/SR6Actor';
import SR6Combat from '@/combat/SR6Combat';
import { InitiativeType } from '@/data';
import { IHasInitiative, AvailableActions } from '@/data/interfaces';

export type CombatantFlagData = {
	initiativeType: InitiativeType;
	availableActions: AvailableActions;
	roundActions: AvailableActions;
};

export default class SR6Combatant extends Combatant<SR6Combat, SR6Actor> {
	get actorSystemData(): IHasInitiative {
		return this.actor.systemData as unknown as IHasInitiative;
	}

	get systemData(): CombatantFlagData {
		return this.getFlag('sr6', 'CombatantFlagData') as CombatantFlagData;
	}

	protected override async _preCreate(
		data: PreDocumentId<this['_source']>,
		options: DocumentModificationContext,
		user: User,
	): Promise<void> {
		console.log('combatant precreate', data, options, user);
	}

	constructor(data: PreCreate<foundry.data.CombatantSource>, context?: DocumentConstructionContext<Combatant>) {
		super(data, context);

		const availableActions = this.actorSystemData.getAvailableActions(InitiativeType.Physical);

		if (this.isOwner) {
			if (!this.getFlag('sr6', 'CombatantFlagData')) {
				void this._setSystemData({
					initiativeType: InitiativeType.Physical,
					availableActions: availableActions,
					roundActions: availableActions,
				});
			}
		}
	}

	async _setSystemData(data: CombatantFlagData): Promise<void> {
		if (!game.user!.isOwner) {
			ui.notifications.error('Cannot set combat data for unowned combatant');
		}

		await this.setFlag('sr6', 'CombatantFlagData', data);
	}

	async _resetActions(): Promise<void> {
		const data = this.systemData;
		data.roundActions = data.availableActions;
		await this._setSystemData(data);
	}

	async _cycleEffects(): Promise<void> {
		// Cycle conditions
		await (this.actor as SR6Actor).cycleActiveEffects();
	}

	async startTurn(): Promise<void> {
		console.log('SR6Combatant::startTurn', this.actor.name);
		if (game.user!.isGM) {
			await this._resetActions();
			await this._cycleEffects();
		}
		await this.actor.startTurn?.(this.parent, this);
	}

	async endTurn(): Promise<void> {
		console.log('SR6Combatant::endTurn', this.actor.name);
		await this.actor.endTurn?.(this.parent, this);
	}

	async startCombat(): Promise<void> {
		console.log('SR6Combatant::startCombat', this.actor.name);
		await this.actor.startCombat?.(this.parent, this);
	}

	async endCombat(): Promise<void> {
		console.log('SR6Combatant::endCombat', this.actor.name);
		await this.actor.endCombat?.(this.parent, this);
	}
}
