/**
 *
 * @author jaynus
 * @file
 */

import SR6Combat, { register as registerCombatSocket } from '@/combat/SR6Combat';
import SR6Combatant from '@/combat/SR6Combatant';
import SR6CombatTracker from '@/combat/SR6CombatTracker';

export function register(): void {
	CONFIG.Combat.documentClass = SR6Combat;
	CONFIG.Combatant.documentClass = SR6Combatant;
	CONFIG.ui.combat = SR6CombatTracker;

	registerCombatSocket();
}
