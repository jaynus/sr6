/**
 *
 * @author jaynus
 * @file Provides typing data for RootContext injected into Vue apps.
 */

import BaseActorDataModel from '@/actor/data/BaseActorDataModel';
import SR6Actor from '@/actor/SR6Actor';
import SR6Combat from '@/combat/SR6Combat';
import SR6Item from '@/item/SR6Item';
import BaseItemDataModel from '@/item/data/BaseItemDataModel';
import SR6ItemSheet from '@/item/SR6ItemSheet';
import SR6ActorSheet from '@/actor/SR6ActorSheet';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ContextBase = { [key: string]: any };

/**
 * This symbol is used by Vue apps in the system to inject sheet data.
 */
export const RootContext = Symbol('Vue Root Context');

/**
 * Typing for context data injected into Vue sheets.
 */
export interface BaseSheetContext<
	DocumentType extends foundry.abstract.Document = foundry.abstract.Document,
	SheetOptionsType extends DocumentSheetOptions = DocumentSheetOptions,
	TSheetType extends DocumentSheet<DocumentType, SheetOptionsType> = DocumentSheet<DocumentType, SheetOptionsType>,
	TSheetDataType extends DocumentSheetData<DocumentType> = DocumentSheetData<DocumentType>,
> extends ContextBase {
	/**
	 * A reference to the Sheet instance the vue app is rendering.
	 */
	sheet: TSheetType;

	/**
	 * Rendering context data retrieved from `getData()`.
	 */
	data: TSheetDataType;
}

export interface SR6ActorSheetData<TActorDataModel extends BaseActorDataModel = BaseActorDataModel>
	extends ActorSheetData<SR6Actor<TActorDataModel>> {
	actor: SR6Actor<TActorDataModel>;
	combat: SR6Combat | null;
}

/**
 * Typing for context data injected into Vue Actor sheets.
 */
export interface ActorSheetContext<
	TActorDataModel extends BaseActorDataModel = BaseActorDataModel,
	TSheetType extends SR6ActorSheet<TActorDataModel> = SR6ActorSheet<TActorDataModel>,
	TSheetDataType extends SR6ActorSheetData<TActorDataModel> = SR6ActorSheetData<TActorDataModel>,
> extends ContextBase {
	/**
	 * A reference to the Sheet instance the vue app is rendering.
	 */
	sheet: TSheetType;

	/**
	 * Rendering context data retrieved from `getData()`.
	 */
	data: TSheetDataType;

	user: User;
}

export interface SR6ItemSheetData<TItemDataModel extends BaseItemDataModel = BaseItemDataModel>
	extends ItemSheetData<SR6Item<TItemDataModel>> {
	item: SR6Item<TItemDataModel>;
}

/**
 * Typing for context data injected into Vue Item sheets.
 */
export interface ItemSheetContext<
	TItemDataModel extends BaseItemDataModel = BaseItemDataModel,
	TSheetType extends SR6ItemSheet<TItemDataModel> = SR6ItemSheet<TItemDataModel>,
	TSheetDataType extends SR6ItemSheetData<TItemDataModel> = SR6ItemSheetData<TItemDataModel>,
> extends ContextBase {
	/**
	 * A reference to the Sheet instance the vue app is rendering.
	 */
	sheet: TSheetType;

	/**
	 * Rendering context data retrieved from `getData()`.
	 */
	data: TSheetDataType;

	user: User;
}
