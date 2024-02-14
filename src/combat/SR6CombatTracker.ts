/**
 *
 * @author jaynus
 * @file
 */

import SR6Combat from '@/combat/SR6Combat';
import SR6Combatant from '@/combat/SR6Combatant';
import { InitiativeType } from '@/data';

export type SR6Turn = CombatTrackerTurn & {
	initiativeType: InitiativeType;
};

export default class SR6CombatTracker extends CombatTracker<SR6Combat> {
	override get template(): string {
		return 'systems/sr6/templates/sidebar/combat-tracker.hbs';
	}

	override async getData(options: CombatTrackerOptions): Promise<CombatTrackerData> {
		const data = await super.getData(options);
		if (data !== undefined) {
			data.turns.forEach((turn) => {
				const sr6turn = turn as SR6Turn;
				const combatant: SR6Combatant | undefined = data.combat?.combatants.get(turn.id) as SR6Combatant;
				if (combatant) {
					sr6turn.initiativeType = combatant!.systemData.initiativeType;
				}
			});
		}

		return data;
	}

	protected override async _onCombatantControl(
		event: JQuery.ClickEvent<HTMLElement, HTMLElement, HTMLElement>,
	): Promise<void> {
		if (event.currentTarget.dataset['combatantId']) {
			const combatant: SR6Combatant = (game.combat!.combatants.get(
				event.currentTarget.dataset['combatantId'],
			) as SR6Combatant)!;

			switch (event.currentTarget.dataset['control']) {
				case 'togglePhysical': {
					await combatant.setFlag('sr6', 'CombatantFlagData.initiativeType', InitiativeType.Physical);
					return;
				}
				case 'toggleMatrix': {
					await combatant.setFlag('sr6', 'CombatantFlagData.initiativeType', InitiativeType.Matrix);
					return;
				}
				case 'toggleAstral': {
					await combatant.setFlag('sr6', 'CombatantFlagData.initiativeType', InitiativeType.Astral);
					return;
				}
			}
		}

		await super._onCombatantControl(event);
	}
}
