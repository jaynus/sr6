/**
 *
 * @author jaynus
 * @file Basic Item Sheet
 */

import SR6Item from '@/item/SR6Item';
import BaseItemDataModel from '@/item/data/BaseItemDataModel';

import './SR6ItemSheet.scss';

/**
 * Basic functionality shared by all ItemSheets.
 */
export default class SR6ItemSheet<ItemDataModel extends BaseItemDataModel = BaseItemDataModel> extends ItemSheet<
	SR6Item<ItemDataModel>
> {
	static override get defaultOptions(): DocumentSheetOptions {
		return {
			...super.defaultOptions,
			classes: ['sr6', 'sheet', 'item'],
			width: 480,
			height: 600,
			dragDrop: [
				{
					dragSelector: '.item-list .item',
				},
			],
			tabs: [
				{
					navSelector: '.sheet-tabs',
					contentSelector: '.sheet-body',
					initial: 'description',
				},
			],
		};
	}

	override activateListeners(html: JQuery<HTMLElement>): void {
		super.activateListeners(html);

		if (this.isEditable) {
			// Foundry v10 and v11 bind this functionality differently so instead we override that behavior with our own.
			html.find('img[data-edit]').off('click');
			html.find('img[data-edit]').on('click', this._onEditImage.bind(this));
		}
	}

	protected override _onDrop(event: ElementDragEvent): void {
		// const data: DragEventData = TextEditor.getDragEventData(event) as DragEventData;

		return super._onDrop(event);
	}
}
