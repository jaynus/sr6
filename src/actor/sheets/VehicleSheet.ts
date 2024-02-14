import VehicleDataModel from '@/actor/data/VehicleDataModel';
import { Component } from 'vue';
import VueVehicleSheet from '@/vue/sheets/actor/VehicleSheet.vue';

import VueSheet from '@/vue/VueSheet';
import SR6ActorSheet from '@/actor/SR6ActorSheet';
import { ActorSheetContext } from '@/vue/SheetContext';

export default class VehicleSheet extends VueSheet(SR6ActorSheet<VehicleDataModel>) {
	get vueComponent(): Component {
		return VueVehicleSheet;
	}

	async getVueContext(): Promise<ActorSheetContext<VehicleDataModel> | undefined> {
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
