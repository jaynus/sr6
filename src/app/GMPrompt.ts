import CharacterDataModel from '@/actor/data/CharacterDataModel';

import SR6Actor from '@/actor/SR6Actor';
import VueGMPrompt from '@/vue/apps/GMPrompt.vue';
import { ContextBase } from '@/vue/SheetContext';
import VueSheet from '@/vue/VueSheet';
import { Err, Ok, Result } from 'ts-results';
import { Component } from 'vue';

export interface GMPromptContext extends ContextBase {
	app: GMPrompt;
}

export class GMPrompt extends VueSheet(Application) {
	static override get defaultOptions(): ApplicationOptions {
		return {
			...super.defaultOptions,
			classes: ['app-gm-prompt'],
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
		return VueGMPrompt;
	}

	async getVueContext(): Promise<GMPromptContext> {
		return {
			app: this,
		};
	}
}
