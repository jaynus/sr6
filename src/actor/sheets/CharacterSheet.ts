/**
 *
 * @author jaynus
 * @file Player Character Sheet
 */

import { Component } from 'vue';
import VueCharacterSheet from '@/vue/sheets/actor/CharacterSheet.vue';

import VueSheet from '@/vue/VueSheet';
import SR6ActorSheet from '@/actor/SR6ActorSheet';
import { ActorSheetContext } from '@/vue/SheetContext';

import SR6Item from '@/item/SR6Item';
import BaseItemDataModel from '@/item/data/BaseItemDataModel';
import CharacterDataModel from '@/actor/data/CharacterDataModel';

/**
 * Actor sheet used for Player Characters
 */
export default class CharacterSheet extends VueSheet(SR6ActorSheet<CharacterDataModel>) {
	get vueComponent(): Component {
		return VueCharacterSheet;
	}

	async getVueContext(): Promise<ActorSheetContext<CharacterDataModel> | undefined> {
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
					initial: 'basics',
				},
			],
		};
	}

	protected override async _onDropItem(
		event: DragEvent,
		data: DropCanvasData<'Item', SR6Item<BaseItemDataModel>>,
	): Promise<SR6Item<BaseItemDataModel>[] | boolean> {
		return await super._onDropItem(event, data);
	}
}
