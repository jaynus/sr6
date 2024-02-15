import BaseActorDataModel from '@/actor/data/BaseActorDataModel';
import SR6Actor from '@/actor/SR6Actor';
import SR6Combat from '@/combat/SR6Combat';
import SR6Combatant from '@/combat/SR6Combatant';
import BaseDataModel from '@/data/BaseDataModel';
import { InitiativeType } from '@/data/index';
import BaseItemDataModel from '@/item/data/BaseItemDataModel';
import MatrixPersonaDataModel from '@/item/data/feature/MatrixPersonaDataModel';
import GearDataModel from '@/item/data/gear/GearDataModel';
import SR6Item from '@/item/SR6Item';
import { Modifiers } from '@/modifier';
import { InitiativeRollData } from '@/roll/InitiativeRoll';
import { Result } from 'ts-results';

export type AvailableActions = {
	major: number;
	minor: number;
};

export interface IHasActor {
	get actor(): SR6Actor | null;
}

export interface IHasModifiers {
	modifiers: Modifiers;
}
export interface IHasSystemData<T extends BaseDataModel = BaseDataModel> {
	getSystemData?(): T;
}

export interface IHasCombat {
	combatantCreated?(combat: SR6Combat, combatant: SR6Combatant): void;

	startCombat?(combat: SR6Combat, combatant: SR6Combatant): Promise<void>;
	endCombat?(combat: SR6Combat, combatant: SR6Combatant): Promise<void>;

	startTurn?(combat: SR6Combat, combatant: SR6Combatant): Promise<void>;
	endTurn?(combat: SR6Combat, combatant: SR6Combatant): Promise<void>;
}

export interface IHasInitiative extends IHasActor, IHasCombat {
	hasInitiativeType(type: InitiativeType): boolean;

	getInitiative(type: InitiativeType): null | InitiativeRollData;

	getAvailableActions(type: InitiativeType): AvailableActions;
}

export interface IHasEdge {
	gainEdge?(count: number): Promise<boolean>;
	spendEdge?(count: number): Promise<boolean>;
}

export interface IHasMatrix {
	matrixIcon?(): Maybe<string>;
	matrixWirelessActive?(): boolean;
	matrixRunningSilent?(): boolean;
}

export interface IHasMatrixPersona extends IHasActor {
	get matrixPersona(): null | MatrixPersonaDataModel;
	set matrixPersona(persona: null | MatrixPersonaDataModel);

	activateMatrixPersona(device: SR6Item<GearDataModel> | null): Promise<SR6Item<MatrixPersonaDataModel>>;
	deactivateMatrixPersona(): Promise<boolean>;
}

/* Utility Interfaces */

export interface IHasPreCreate<TDocumentType extends foundry.abstract.Document> {
	preCreate?(
		document: TDocumentType,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		data: PreDocumentId<any>,
		options: DocumentModificationContext<TDocumentType>,
		user: foundry.documents.BaseUser,
	): Promise<void>;
}

export interface IHasPostCreate {
	onPostCreate?(): Promise<void>;
}

export interface IHasOnDelete<DocumentType extends foundry.abstract.Document> {
	onDelete?(document: DocumentType, options: DocumentModificationContext<DocumentType>, userId: string): void;
}

export interface IHasOnUpdate<TDocumentType extends foundry.abstract.Document> {
	onUpdate?(
		changed: DeepPartial<TDocumentType['_source']>,
		options: DocumentUpdateContext<TDocumentType>,
		userId: string,
	): Promise<void>;
}

export interface IHasOnDropActor<TActorDataModel extends BaseActorDataModel> {
	onDropActor?(
		event: ElementDragEvent,
		data: DropCanvasData<'Actor', SR6Actor<TActorDataModel>>,
	): Promise<false | void>;
}

export interface IHasOnDropItem<TItemDataModel extends BaseItemDataModel> {
	onDropItem?(
		event: DragEvent,
		data: DropCanvasData<'Item', SR6Item<TItemDataModel>>,
	): Promise<SR6Item<TItemDataModel>[] | boolean>;
}

export interface IHasLinks {
	cleanLinks?(): Promise<void>;
	link?(item: SR6Item<BaseItemDataModel>, slot: Maybe<string>): Promise<Result<Maybe<string>, string>>;
	unlink?(item: SR6Item<BaseItemDataModel>): Promise<Result<null, string>>;
}
