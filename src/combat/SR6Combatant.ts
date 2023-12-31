/**
 *
 * @author jaynus
 * @file
 */

import LifeformDataModel from '@/actor/data/LifeformDataModel';
import SR6Actor from '@/actor/SR6Actor';
import SR6Combat from '@/combat/SR6Combat';
import { ConditionActiveEffectData } from '@/condition/ConditionDataModel';
import { InitiativeType } from '@/data';
import IHasInitiative, { AvailableActions } from '@/data/IHasInitiative';
import SR6Effect from '@/effects/SR6Effect';
import { getInitiativeRoll } from '@/roll/Rollers';

export type CombatantFlagData = {
	initiativeType: InitiativeType;
	availableActions: AvailableActions;
	roundActions: AvailableActions;
};

export default class SR6Combatant extends Combatant<SR6Combat, SR6Actor> {
	get actorSystemData(): IHasInitiative {
		return this.actor.systemData as LifeformDataModel as IHasInitiative;
	}

	get systemData(): CombatantFlagData {
		return this.getFlag('sr6', 'CombatantFlagData') as CombatantFlagData;
	}

	constructor(data: PreCreate<foundry.data.CombatantSource>, context?: DocumentConstructionContext<Combatant>) {
		super(data, context);

		const availableActions = this.actorSystemData.getAvailableActions(InitiativeType.Physical);

		if (this.isOwner) {
			void this._setSystemData({
				initiativeType: InitiativeType.Physical,
				availableActions: availableActions,
				roundActions: availableActions,
			});
		}
	}

	async _setSystemData(data: CombatantFlagData): Promise<void> {
		if (!this.isOwner && !game.user!.isGM) {
			ui.notifications.error('Cannot set combat data for unowned combatant');
		}

		await this.setFlag('sr6', 'CombatantFlagData', data);
	}

	async _resetActions(): Promise<void> {
		const data = this.systemData;
		data.roundActions = data.availableActions;
		await this._setSystemData(data);
	}

	async _cycleConditions(): Promise<void> {
		// Cycle conditions
		const toDelete: string[] = [];
		this.actor.items
			.filter((i) => i.type === 'condition')
			.forEach((item) => {
				item.effects.forEach((effect) => {
					const e = effect as SR6Effect;
					if (e.isTemporary && e.duration.remaining !== null && e.duration.remaining < 1) {
						toDelete.push(item.id);
					}
				});
			});
		for (const itemId of toDelete) {
			await this.actor.items.get(itemId)!.delete();
		}
	}

	async nextRound(): Promise<void> {}

	async beginTurn(): Promise<void> {
		await this._resetActions();
		await this._cycleConditions();
	}

	async endTurn(): Promise<void> {}

	override _getInitiativeFormula(): string {
		const formula = this.actorSystemData.getInitiativeFormula(this.systemData.initiativeType);
		if (formula) {
			return formula!;
		} else {
			ui.notifications.error!(`This actor cannot do initiative of this type? ${this.systemData.initiativeType}`);
			throw 'ERR';
		}
	}

	override getInitiativeRoll(f: string): Roll {
		return getInitiativeRoll(this.actorSystemData, this._getInitiativeFormula());
	}
}
