import SpriteDataModel from '@/actor/data/SpriteDataModel';
import { Component } from 'vue';
import VueSpriteSheet from '@/vue/sheets/actor/SpriteSheet.vue';

import VueSheet from '@/vue/VueSheet';
import SR6ActorSheet from '@/actor/SR6ActorSheet';
import { ActorSheetContext } from '@/vue/SheetContext';

export default class SpriteSheet extends VueSheet(SR6ActorSheet<SpriteDataModel>) {
	get vueComponent(): Component {
		return VueSpriteSheet;
	}

	async getVueContext(): Promise<ActorSheetContext<SpriteDataModel> | undefined> {
		return {
			sheet: this,
			data: {
				...(await this.getData()),
				combat: game.combat,
			},
			user: game.user!,
		};
	}

	static override get defaultOptions(): ActorSheetOptions {
		return {
			...super.defaultOptions,
			tabs: [
				{
					navSelector: '.sheet-tabs',
					contentSelector: '.sheet-body',
					initial: 'data',
				},
			],
		};
	}
}
