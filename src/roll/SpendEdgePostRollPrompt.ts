/**
 * FVTT-SR6
 * Unofficial implementation of the SR6 RPG for Foundry
 *
 * @author jaynus
 * @file Dice roll prompt app.
 */

import BaseActorDataModel from '@/actor/data/BaseActorDataModel';
import { SR6ChatMessage } from '@/chat/SR6ChatMessage';
import { IEdgeBoost } from '@/edge';

import SR6Actor from '@/actor/SR6Actor';

import { ITest } from '@/test';
import { ContextBase } from '@/vue/SheetContext';
import VueRollPrompt from '@/roll/vue/SpendEdgePostRollPrompt.vue';
import VueSheet from '@/vue/VueSheet';
import { Component } from 'vue';

export interface SpendEdgePostRollPromptContext extends ContextBase {
	actor: SR6Actor<BaseActorDataModel>;
	message: SR6ChatMessage;
	test: ITest;
	resolvePromise: (value: IEdgeBoost | null) => void;
}

export default class SpendEdgePostRollPrompt extends VueSheet(Application) {
	get vueComponent(): Component {
		return VueRollPrompt;
	}

	static override get defaultOptions(): ApplicationOptions {
		return {
			...super.defaultOptions,
			classes: ['app-roll-prompt'],
			width: 500,
			scroll: true,
			focus: true,
		};
	}

	static async prompt(message: SR6ChatMessage, test: ITest): Promise<IEdgeBoost | null> {
		const sheet = new SpendEdgePostRollPrompt(message, test);
		await sheet.render(true);

		return new Promise<IEdgeBoost | null>((resolve) => {
			sheet.#resolvePromise = resolve;
		});
	}

	#resolvePromise?: (value: IEdgeBoost | null) => void;

	message: SR6ChatMessage;
	test: ITest;

	constructor(message: SR6ChatMessage, test: ITest) {
		super();
		this.test = test;
		this.message = message;
	}

	override async close(options = {}): Promise<void> {
		this.#resolvePromise?.(null);
		return super.close(options);
	}

	async getVueContext(): Promise<SpendEdgePostRollPromptContext> {
		return {
			resolvePromise: async (data) => {
				this.#resolvePromise?.(data);
				this.#resolvePromise = undefined;

				await this.close();
			},
			actor: this.test.actor,
			message: this.message,
			test: this.test,
		};
	}
}
