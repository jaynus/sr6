export type SR6RollOptions = {
	parameters?: { glitch: number[]; success: number[] };
	threshold?: number;
} & RollOptions;

export default class SR6Roll extends Roll {
	declare options: SR6RollOptions;

	getRollData(): Record<string, unknown> {
		return {
			hits: this.hits,
			glitches: this.glitches,
			net_hits: this.net_hits,
			total: this.total,
			success: this.success,
			glitch: this.is_glitch,
			critical_glitch: this.is_critical_glitch,
			threshold: this.threshold,
			pool: this.pool,
		};
	}

	get success(): boolean {
		if (this.options.threshold!) {
			return this.hits >= this.options.threshold!;
		} else {
			return this.hits > 0;
		}
	}

	get net_hits(): number {
		if (this.options.threshold!) {
			return Math.max(0, this.hits - (this.options.threshold! ? this.options.threshold! : 0));
		}
		return this.hits;
	}

	override get formula(): string {
		return `${this.pool}d6`;
	}

	get threshold(): number | undefined {
		return this.options.threshold;
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
		return this.sides.reduce(
			(hits, result) => (this.options.parameters!.success.includes(result) ? hits + 1 : hits),
			0,
		);
	}

	get glitches(): number {
		return this.sides.reduce(
			(glitches, result) => (this.options.parameters!.glitch.includes(result) ? glitches + 1 : glitches),
			0,
		);
	}

	get is_glitch(): boolean {
		return this.glitches > Math.floor(this.pool / 2);
	}

	get is_critical_glitch(): boolean {
		return this.is_glitch && this.hits === 0;
	}

	async rerollOne(die: null | number = null): Promise<boolean> {
		if (die === null) {
			die = this._getLowestRollIndex();
		}
		const reroll = SR6Roll.createRoll(1);
		reroll.evaluate({ async: false });
		await reroll.showVisual();

		this._updateDie(die, (reroll.terms[0] as PoolTerm).results[0].result);

		return true;
	}

	addOne(die: null | number = null): boolean {
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
				'You are adding +1 to a roll with no glitches and no near-successes, this was worthless',
			);
			return false;
		}

		return false;
	}

	addDie(die: null | number = null): void {
		(this.terms[0] as DiceTerm).results.push({
			active: true,
			result: die ? die : 6,
		});
	}

	// return false if theres no glitches to reroll
	async rerollFailed(): Promise<boolean> {
		const failedList: number[] = [];
		for (let i = 0; i < this.sides.length; i++) {
			if (!this.options.parameters!.success.includes(this.sides[i])) {
				failedList.push(i);
			}
		}

		if (failedList.length === 0) {
			return false;
		}

		const reroll = SR6Roll.createRoll(failedList.length);
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
			void game.dice3d.showForRoll(this, (game as Game).user, true);
		}
	}

	async explode(): Promise<void> {
		if (this.sixes > 0) {
			const explode_roll = SR6Roll.createRoll(this.sixes);
			explode_roll.evaluate({ async: false });
			await explode_roll.showVisual();

			// recurse the explosions
			const explode_results = (explode_roll.terms[0] as DiceTerm).results;
			if (explode_roll.sixes > 0) {
				await explode_roll.explode();
			}

			// Add the results to our results
			(this.terms[0] as DiceTerm).results = (this.terms[0] as DiceTerm).results.concat(explode_results);
		}
	}

	_getLowestRollIndex(): number {
		return this.sides.indexOf(Math.min(...this.sides));
	}

	_updateDie(idx: number, value: number): void {
		(this.terms[0] as DiceTerm).results[idx].result = value;
	}

	protected constructor(formula: string, data?: Record<string, unknown>, options?: RollOptions) {
		const configuredOptions = foundry.utils.mergeObject(options ? options : {}, {
			parameters: { glitch: [1], success: [5, 6] },
			pool: 0,
		});
		super(formula, data, configuredOptions);
	}

	static createRoll(pool: number, data?: Record<string, unknown>, options?: SR6RollOptions): SR6Roll {
		const configuredOptions = foundry.utils.mergeObject(options ? options : {}, {
			parameters: { glitch: [1, 2], success: [5, 6] },
			pool: pool,
		});

		return new SR6Roll(`${pool}d6`, data, configuredOptions);
	}
}
