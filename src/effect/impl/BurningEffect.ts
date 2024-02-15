import SR6Combat from '@/combat/SR6Combat';
import SR6Combatant from '@/combat/SR6Combatant';
import { BaseEffect, BaseEffectSourceData } from '@/effect/BaseEffect';
import SR6ActiveEffect from '@/effect/SR6ActiveEffect';

interface BurningEffectSourceData extends BaseEffectSourceData {
	lastRound: Maybe<number>;
}

export class BurningEffect extends BaseEffect<BurningEffectSourceData> {
	async startCombat(combat: SR6Combat, combatant: SR6Combatant): Promise<void> {
		console.log('BurningEffect::startCombat', this.data, combat);
	}
	async startTurn(combat: SR6Combat, combatant: SR6Combatant): Promise<void> {
		console.log('BurningEffect::startTurn', this.data, combat);
	}

	constructor({ parent, data }: { parent: SR6ActiveEffect; data: BurningEffectSourceData }) {
		super({ parent, data });
		this.data.lastRound = this.data.lastRound || game.combat?.round || null;
	}
}
