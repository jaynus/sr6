/**
 *
 * @author jaynus
 * @file Player Character Sheet
 */

import MatrixHostDataModel from '@/actor/data/MatrixHostDataModel';
import { Component } from 'vue';
import VueMatrixHostSheet from '@/vue/sheets/actor/MatrixHostSheet.vue';

import VueSheet from '@/vue/VueSheet';
import SR6ActorSheet from '@/actor/SR6ActorSheet';
import { ActorSheetContext } from '@/vue/SheetContext';

/**
 * Actor sheet used for Player Characters
 */
export default class MatrixHostSheet extends VueSheet(SR6ActorSheet<MatrixHostDataModel>) {
	get vueComponent(): Component {
		return VueMatrixHostSheet;
	}

	async getVueContext(): Promise<ActorSheetContext<MatrixHostDataModel> | undefined> {
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

	protected override _render(force?: boolean, options?: RenderOptions): Promise<void> {
		// Refresh any linked IC sheets whenever we render
		this.actor.systemData.programs.forEach((program) => program.sheet.render(false));

		return super._render(force, options);
	}
}
