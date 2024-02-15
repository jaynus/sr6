/**
 *
 * @author jaynus
 * @file
 */

import SR6Actor from '@/actor/SR6Actor';
import SR6Combatant, { CombatantFlagData } from '@/combat/SR6Combatant';
import { IHasInitiative } from '@/data/interfaces';
import InitiativeRollPrompt from '@/roll/InitiativeRollPrompt';
import { emit as socketEmit, SOCKET_NAME, SocketPayload, SocketOperation, CombatSocketBaseData } from '@/socket';

export default class SR6Combat extends Combat<SR6Combatant> {
	constructor(data: PreCreate<foundry.data.CombatSource>, context?: DocumentConstructionContext<Combat>) {
		super(data, context);

		// Add any open actor sheets
		for (const windowId in ui.windows) {
			if (ui.windows[windowId] instanceof ActorSheet) {
				this.apps[windowId] = ui.windows[windowId];
			}
		}
	}

	override prepareDerivedData(): void {
		super.prepareDerivedData();
	}

	override async startCombat(): Promise<this> {
		if (this.turns[0]) {
			const next = this.turns[0];
			await next.startTurn();
		}
		for (const combatant of this.combatants) {
			await combatant.startCombat();
		}

		return super.startCombat();
	}

	override async endCombat(): Promise<this> {
		for (const combatant of this.combatants) {
			await combatant.endCombat();
		}

		return super.endCombat();
	}

	getCombatantData(actor: SR6Actor): null | CombatantFlagData {
		const entry = this.combatants.find((c) => c.actor!.uuid === actor.uuid);
		if (entry) {
			return entry.systemData;
		}

		return null;
	}

	async setCombatantData(actor: SR6Actor, data: CombatantFlagData): Promise<void> {
		const entry = this.combatants.find((c) => c.actor!.uuid === actor.uuid);
		if (entry) {
			await entry._setSystemData(data);
		}
	}

	override nextTurn(): Promise<this> {
		if (this.nextCombatant) {
			void this.nextCombatant!.startTurn();
		}
		if (this.combatant) {
			void this.combatant!.endTurn();
		}

		socketEmit(SocketOperation.UpdateCombatTracker, { combatId: this.id });

		return super.nextTurn();
	}

	override async previousTurn(): Promise<this> {
		if (this.previous && this.previous.combatantId && this.turn > 0) {
			await this.combatants.get(this.previous!.combatantId!).startTurn();
		}

		if (this.combatant) {
			await this.combatant!.endTurn();
		}

		socketEmit(SocketOperation.UpdateCombatTracker, { combatId: this.id });

		return super.previousTurn();
	}

	override nextRound(): Promise<this> {
		return super.nextRound();
	}

	override previousRound(): Promise<this> {
		return super.previousRound();
	}

	override async rollInitiative(
		ids: string | string[],
		opts: RollInitiativeOptions = { formula: null, updateTurn: true, messageOptions: {} },
	): Promise<this> {
		// Structure input data
		ids = typeof ids === 'string' ? [ids] : ids;
		const currentId = this.combatant?.id;
		const chatRollMode = game.settings.get('core', 'rollMode');

		// Iterate over Combatants, performing an initiative roll for each
		const updates = [];
		const messages = [];
		for (const [i, id] of ids.entries()) {
			// Get Combatant data (non-strictly)
			const combatant = this.combatants.get(id);
			if (!combatant?.isOwner) continue;

			// Produce an initiative roll for the Combatant
			const roll = await InitiativeRollPrompt.prompt(
				combatant.actor as unknown as SR6Actor<IHasInitiative>,
				combatant.systemData.initiativeType,
			);

			if (roll) {
				await roll.evaluate({ async: true });
				updates.push({ _id: id, initiative: roll.total });

				// Construct chat message data
				const chatData: foundry.data.ChatMessageSource = await roll.toMessage(
					foundry.utils.mergeObject(
						{
							speaker: ChatMessage.getSpeaker({
								actor: combatant.actor,
								token: combatant.token,
								alias: combatant.name,
							}),
							flavor: game.i18n.format('COMBAT.RollsInitiative', { name: combatant.name }),
							flags: { 'core.initiativeRoll': true },
						},
						opts.messageOptions,
					),
					{ create: false },
				);

				// If the combatant is hidden, use a private roll unless an alternative rollMode was explicitly requested
				chatData.rollMode =
					'rollMode' in opts.messageOptions
						? opts.messageOptions.rollMode
						: combatant.hidden
							? CONST.DICE_ROLL_MODES.PRIVATE
							: chatRollMode;

				// Play 1 sound for the whole rolled set
				if (i > 0) chatData.sound = null;
				messages.push(chatData);
			}
		}
		if (!updates.length) return this;

		// Update multiple combatants
		await this.updateEmbeddedDocuments('Combatant', updates);

		// Ensure the turn order remains with the same combatant
		if (opts.updateTurn && currentId) {
			await this.update({ turn: this.turns.findIndex((t) => t.id === currentId) });
		}

		// Create multiple chat messages
		await ChatMessage.implementation.create(messages);
		return this;
	}

	debounceRender = foundry.utils.debounce(() => {
		if (ui.combat.viewed === this) {
			ui.combat.render();
		}
	}, 50);
}

/**
 * Register socket listener for SR6 Combats
 */
export function register(): void {
	game.socket.on(SOCKET_NAME, async (payload: SocketPayload<CombatSocketBaseData>) => {
		if (!payload.data) {
			return;
		}

		const combat = game.combats.get(payload.data.combatId) as SR6Combat | undefined;
		if (!combat) {
			console.error(
				`Socket received ${SocketOperation[payload.operation]} payload with invalid combat ID ${
					payload.data.combatId
				}`,
			);
			return;
		}

		switch (payload.operation) {
			case SocketOperation.UpdateCombatTracker:
				combat.debounceRender();

				// Debounce any visible actor sheets as well

				break;
		}
	});
}
