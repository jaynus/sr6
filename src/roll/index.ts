import SR6Roll from '@/roll/SR6Roll';
import InitiativeRoll from '@/roll/InitiativeRoll';

export function register(): void {
	CONFIG.Dice.rolls = [SR6Roll, InitiativeRoll];
}
