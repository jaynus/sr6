import InitiativeDataModel from '@/data/InitiativeDataModel';

export class InitiativeRollData {
	score: number;
	dice: number;
	constructor(source: InitiativeDataModel) {
		this.score = source.score;
		this.dice = source.dice;
	}
}

export default class InitiativeRoll extends Roll {
	protected constructor(formula: string, data?: Record<string, unknown>, options?: RollOptions) {
		super(formula, data, options);
	}

	static createRoll(
		initiativeData: InitiativeRollData,
		data?: Record<string, unknown>,
		options?: RollOptions,
	): InitiativeRoll {
		return new InitiativeRoll(`${initiativeData.score} + ${initiativeData.dice}d6`, data, {
			...options,
			initiativeRoll: true,
		});
	}
}
