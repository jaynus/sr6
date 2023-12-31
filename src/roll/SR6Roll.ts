import SR6Actor from '@/actor/SR6Actor';
import * as util from '@/util';
import { RollType } from '@/roll';

export type SR6RollData = {
	type: RollType;
	actorId: ActorUUID | null;
	auto_hits: number;
	explode: boolean;
	pool: number;
	parameters: { glitch: number[]; success: number[] };
	threshold: null | number;
	template: string;
};

export class SR6Roll extends Roll {
	static override CHAT_TEMPLATE = 'systems/sr6/templates/chat/rolls/SR6Roll.hbs';

	static defaultOptions(): SR6RollData {
		return {
			actorId: null,
			type: RollType.Other,
			auto_hits: 0,
			pool: 0,
			explode: false,
			threshold: null,
			parameters: { glitch: [1], success: [5, 6] },
			template: this.CHAT_TEMPLATE,
		};
	}

	get success(): boolean {
		if (this.options.threshold) {
			return this.hits >= this.options.threshold;
		} else {
			return true;
		}
	}

	get net_hits(): number {
		if (this.options.threshold) {
			return Math.max(0, (this.options.threshold ? this.options.threshold : 0) - this.hits);
		}
		return this.hits;
	}

	override get formula(): string {
		return this._formula;
	}

	get pool(): number {
		return (this.terms[0] as DiceTerm).results.length;
	}

	get sixes(): number {
		return this.sides.reduce((hits, result) => (result === 6 ? hits + 1 : hits), 0);
	}

	get sides(): number[] {
		return (this.terms[0] as DiceTerm).results.map((result: DiceTermResult) => result.result);
	}

	get hits(): number {
		const hits: number = this.sides.reduce(
			(hits, result) => (this.options.parameters.success.includes(result) ? hits + 1 : hits),
			0
		);
		if (this.options.auto_hits !== undefined) {
			return hits + this.options.auto_hits;
		} else {
			return hits;
		}
	}

	get glitches(): number {
		return this.sides.reduce(
			(glitches, result) => (this.options.parameters.glitch.includes(result) ? glitches + 1 : glitches),
			0
		);
	}

	get is_glitch(): boolean {
		return this.glitches > Math.floor(this.pool / 2);
	}

	get is_critical_glitch(): boolean {
		return this.is_glitch && this.hits === 0;
	}

	async finish(): Promise<void> {
		if (this.options.explode) {
			await this.explode();
		}
	}

	async rerollOne(die: null | number = null): Promise<boolean> {
		if (die === null) {
			die = this._getLowestRollIndex();
		}
		const reroll = new SR6Roll(`1d6`);
		reroll.evaluate({ async: false });
		await reroll.showVisual();

		this._updateDie(die, (reroll.terms[0] as PoolTerm).results[0].result);

		return true;
	}

	async addOne(die: null | number = null): Promise<boolean> {
		if (die === null) {
			// Find the best candidate to add one to,

			// First check for glitches and replace
			if (this.glitches - 1 <= Math.floor(this.pool / 2)) {
				const idx_glitch: undefined | number = this.sides.indexOf(1);
				if (idx_glitch !== -1) {
					this._updateDie(idx_glitch, this.sides[idx_glitch] + 1);
					return true;
				}
			}

			// this should be a 4 ideally next
			const idx_four: undefined | number = this.sides.indexOf(4);
			if (idx_four !== -1) {
				this._updateDie(idx_four, this.sides[idx_four] + 1);
				return true;
			}

			ui.notifications!.warn(
				'You are adding +1 to a roll with no glitches and no near-successes, this was worthless'
			);
			return false;
		}

		return false;
	}

	// return false if there are no hits to buy
	async addHit(): Promise<boolean> {
		this.options.auto_hits! += 1;

		return true;
	}

	// return false if there are no hits to buy
	async addHitToPool(die: null | number = null): Promise<boolean> {
		(this.terms[0] as DiceTerm).results.push({
			active: true,
			result: 5,
		});
		this._termsUpdated();

		return true;
	}

	// return false if theres no glitches to reroll
	async rerollFailed(): Promise<boolean> {
		const failedList: number[] = [];
		for (let i = 0; i < this.sides.length; i++) {
			if (!this.options.parameters.success.includes(this.sides[i])) {
				failedList.push(i);
			}
		}

		if (failedList.length === 0) {
			return false;
		}

		const reroll = new SR6Roll(`${failedList.length}d6`);
		reroll.evaluate({ async: false });
		await reroll.showVisual();

		// Replace the glitches.
		for (let i = 0; i < failedList.length; i++) {
			this._updateDie(failedList[i], (reroll.terms[0] as DiceTerm).results[i].result);
		}

		return true;
	}

	async showVisual(): Promise<void> {
		if (game.dice3d) {
			// DICE-SO-NICE show the roll
			await game.dice3d.showForRoll(this, (game as Game).user, true);
		}
	}

	async explode(): Promise<void> {
		if (this.sixes > 0) {
			const explode_roll = new SR6Roll(`${this.sixes}d6`);
			explode_roll.evaluate({ async: false });
			await explode_roll.showVisual();

			// recurse the explosions
			const explode_results = (explode_roll.terms[0] as DiceTerm).results;
			if (explode_roll.sixes > 0) {
				await explode_roll.explode();
			}

			// Add the results to our results
			(this.terms[0] as DiceTerm).results = (this.terms[0] as DiceTerm).results.concat(explode_results);
			this._termsUpdated();
		}
	}

	_termsUpdated(): void {
		// TODO: make sure we dont need this? what kind of rollterm do we have? do we need to simplify?
		// (this.terms[0] as DiceTerm).number = (this.terms[0] as DiceTerm).results.length;
	}

	_getLowestRollIndex(): number {
		return this.sides.indexOf(Math.min(...this.sides));
	}

	_updateDie(idx: number, value: number): void {
		(this.terms[0] as DiceTerm).results[idx].result = value;
	}

	override async render(options: Record<string, unknown> = {}): Promise<string> {
		if (!this._evaluated) await this.evaluate({ async: true });

		await util.waitForCanvasTokens();

		return renderTemplate(this.options.template, {
			user: game.user!.id,
			tooltip: options.isPrivate ? '' : await this.getTooltip(),
			roll: this,
			actor: this.options.actorId ? util.getActor(SR6Actor, this.options.actorId!) : undefined,
			config: CONFIG,
		});
	}

	constructor(formula: string, data?: Record<string, unknown>, options?: Record<string, unknown>) {
		super(formula, data, options);

		if (data && Object.prototype.hasOwnProperty.call(data, 'actor') && data['actor']) {
			this.options.actorId = (data['actor'] as SR6Actor).uuid;
		}

		this.options = foundry.utils.mergeObject(SR6Roll.defaultOptions(), this.options);
	}
}

export interface SR6Roll extends Roll {
	options: SR6RollData;
}
