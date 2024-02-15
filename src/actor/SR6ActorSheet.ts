/**
 *
 * @author jaynus
 * @file Basic Actor Sheet
 */
import CharacterDataModel from '@/actor/data/CharacterDataModel';
import SR6Actor from '@/actor/SR6Actor';
import { ImportPrompt } from '@/app/ImportPrompt';
import BaseItemDataModel from '@/item/data/BaseItemDataModel';
import BaseActorDataModel from '@/actor/data/BaseActorDataModel';
import SR6Item from '@/item/SR6Item';
import { IHasOnDropActor, IHasOnDropItem } from '@/data/interfaces';
import './SR6ActorSheet.scss';

export default class SR6ActorSheet<
	TActorDataModel extends BaseActorDataModel = BaseActorDataModel,
	TItemDataModel extends BaseItemDataModel = BaseItemDataModel,
> extends ActorSheet<SR6Actor<TActorDataModel>, SR6Item<TItemDataModel>> {
	constructor(object: SR6Actor<TActorDataModel>, options?: Partial<ActorSheetOptions>) {
		super(object, options);

		// Add actor sheets to teh combat apps so when combat updates, the character sheet does
		if (game.combat) {
			game.combat!.apps[this.appId] = this;
		}
	}

	static override get defaultOptions(): ActorSheetOptions {
		return {
			...super.defaultOptions,
			classes: ['sr6', 'sheet', 'actor'],
			width: 750,
			height: 640,
		};
	}

	override activateListeners(html: JQuery): void {
		super.activateListeners(html);

		if (this.isEditable) {
			// Foundry v10 and v11 bind this functionality differently so instead we override that behavior with our own.
			html.find('img[data-edit]').off('click');
			html.find('img[data-edit]').on('click', this._onEditImage.bind(this));
		}
	}

	protected override async _renderOuter(options: RenderOptions): Promise<JQuery> {
		const outer = await super._renderOuter(options);

		if (this.actor.systemData instanceof CharacterDataModel) {
			// Add import button
			const importButton = $(
				'<a class="sr6-import-button" title="SR6 Importer"><i class="fa-solid fa-file-import"></i></a>',
			);
			importButton.on('click', async (_ev: JQuery.ClickEvent) => {
				const importPrompt = new ImportPrompt(this.actor as unknown as SR6Actor<CharacterDataModel>);
				await importPrompt.render(true);
			});

			outer.find('.window-title').append(importButton);
		}

		return outer;
	}

	protected override async _onDropActor(
		event: ElementDragEvent,
		data: DropCanvasData<'Actor', SR6Actor<TActorDataModel>>,
	): Promise<false | void> {
		if ((<IHasOnDropActor<TActorDataModel>>this.actor.systemData).onDropActor) {
			return (<IHasOnDropActor<TActorDataModel>>this.actor.systemData).onDropActor!(event, data);
		} else {
			return super._onDropActor(event, data);
		}
	}

	protected override async _onDropItem(
		event: DragEvent,
		data: DropCanvasData<'Item', SR6Item<TItemDataModel>>,
	): Promise<SR6Item<TItemDataModel>[] | boolean> {
		if ((<IHasOnDropItem<TItemDataModel>>this.actor.systemData).onDropItem) {
			return (<IHasOnDropItem<TItemDataModel>>this.actor.systemData).onDropItem!(event, data);
		} else {
			return super._onDropItem(event, data);
		}
	}
}
