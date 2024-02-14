import { InitiativeType } from '@/data';
import { IHasInitiative } from '@/data/interfaces';

import SR6Actor from '@/actor/SR6Actor';
import InitiativeRoll, { InitiativeRollData } from '@/roll/InitiativeRoll';
import { ContextBase } from '@/vue/SheetContext';
import VueRollPrompt from '@/roll/vue/InitiativeRollPrompt.vue';
import VueSheet from '@/vue/VueSheet';
import { Component } from 'vue';

export interface InitiativeRollPromptContext extends ContextBase {
	actor: SR6Actor<IHasInitiative>;
	data: InitiativeRollData;
	resolvePromise: (roll: InitiativeRollData) => void;
}

export default class InitiativeRollPrompt extends VueSheet(Application) {
	actor: SR6Actor<IHasInitiative>;

	get vueComponent(): Component {
		return VueRollPrompt;
	}

	static override get defaultOptions(): ApplicationOptions {
		return {
			...super.defaultOptions,
			title: 'Roll Initiative',
			classes: ['app-roll-prompt'],
			width: 500,
			scroll: true,
			focus: true,
		};
	}

	static async prompt(
		actor: SR6Actor<IHasInitiative>,
		initiativeType: InitiativeType,
	): Promise<InitiativeRoll | null> {
		const sheet = new InitiativeRollPrompt(actor, initiativeType);
		await sheet.render(true);

		return new Promise<InitiativeRoll | null>((resolve) => {
			sheet.#resolvePromise = resolve;
		});
	}

	#resolvePromise?: (value: InitiativeRoll | null) => void;

	data: InitiativeRollData;

	constructor(actor: SR6Actor<IHasInitiative>, initiativeType: InitiativeType) {
		super();
		const initiative = actor.systemData.getInitiative(initiativeType);
		if (!initiative) {
			void this.close();
			throw 'err';
		}
		this.data = initiative;
		this.actor = actor;
	}

	override async close(options = {}): Promise<void> {
		this.#resolvePromise?.(null);
		return super.close(options);
	}

	async getVueContext(): Promise<InitiativeRollPromptContext> {
		return {
			resolvePromise: async (data: InitiativeRollData) => {
				this.#resolvePromise?.(InitiativeRoll.createRoll(data));
				this.#resolvePromise = undefined;

				await this.close();
			},
			actor: this.actor,
			data: this.data,
		};
	}
}
