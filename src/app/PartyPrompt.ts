import CharacterDataModel from '@/actor/data/CharacterDataModel';

import SR6Actor from '@/actor/SR6Actor';
import VuePartyPrompt from '@/vue/apps/PartyPrompt.vue';
import { ContextBase } from '@/vue/SheetContext';
import VueSheet from '@/vue/VueSheet';
import { Err, Ok, Result } from 'ts-results';
import { Component } from 'vue';

export interface PartyPromptContext extends ContextBase {
	app: PartyPrompt;
}

export class PartyPrompt extends VueSheet(Application) {
	static override get defaultOptions(): ApplicationOptions {
		return {
			...super.defaultOptions,
			classes: ['app-party-prompt'],
			width: 500,
			height: 600,
			scroll: true,
		};
	}

	constructor() {
		super();
	}

	override async close(options: {} = {}): Promise<void> {
		return super.close(options);
	}

	get vueComponent(): Component {
		return VuePartyPrompt;
	}

	async getVueContext(): Promise<PartyPromptContext> {
		return {
			app: this,
		};
	}
}
