export default class FormulaRoll extends Roll {
	constructor(formula: string, data?: Record<string, unknown>, options?: RollOptions) {
		super(formula, data, options);
	}

	override toMessage(
		messageData: PreCreate<foundry.data.ChatMessageSource> | undefined,
		opts: { rollMode?: RollMode | 'roll'; create: false },
	): Promise<foundry.data.ChatMessageSource>;
	override toMessage(
		messageData?: PreCreate<foundry.data.ChatMessageSource>,
		opts?: { rollMode?: RollMode | 'roll'; create?: true },
	): Promise<ChatMessage>;
	override toMessage(
		_messageData?: PreCreate<foundry.data.ChatMessageSource>,
		_opts?: { rollMode?: RollMode | 'roll'; create?: boolean },
	): Promise<ChatMessage | foundry.data.ChatMessageSource> {
		const err = 'Formula rolls do not output to a message';
		console.warn(err);
		throw err;
	}
}
