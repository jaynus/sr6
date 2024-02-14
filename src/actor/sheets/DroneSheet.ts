import DroneDataModel from '@/actor/data/DroneDataModel';
import { Component } from 'vue';
import VueDroneSheet from '@/vue/sheets/actor/DroneSheet.vue';

import VueSheet from '@/vue/VueSheet';
import SR6ActorSheet from '@/actor/SR6ActorSheet';
import { ActorSheetContext } from '@/vue/SheetContext';

export default class DroneSheet extends VueSheet(SR6ActorSheet<DroneDataModel>) {
	get vueComponent(): Component {
		return VueDroneSheet;
	}

	async getVueContext(): Promise<ActorSheetContext<DroneDataModel> | undefined> {
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
