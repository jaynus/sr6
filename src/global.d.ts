import SR6Actor from '@/actor/SR6Actor';
import { SR6ChatMessage } from '@/chat/SR6ChatMessage';
import SR6Effect from '@/effect/SR6Effect';
import SR6Item from '@/item/SR6Item';
import SR6Combat from '@/combat/SR6Combat';
import SR6Combatant from '@/combat/SR6Combatant';
import SR6CombatTracker from '@/combat/SR6CombatTracker';
import { SR6_CONFIG } from '@/config';
import { Logger } from 'tslog';

declare global {
	declare let log: Logger;

	const ui: FoundryUI;

	const canvas: Canvas;

	interface SR6Config
		extends Config<
			AmbientLightDocument,
			SR6Effect,
			SR6Actor,
			ActorDirectory<SR6Actor>,
			SR6ChatMessage,
			SR6Combat,
			SR6Combatant,
			SR6CombatTracker,
			CompendiumDirectory,
			Hotbar,
			SR6Item,
			Macro,
			MeasuredTemplateDocument,
			TileDocument,
			TokenDocument,
			Scene,
			User,
			EffectsCanvasGroup
		> {
		sr6: typeof SR6_CONFIG;
	}
	const CONFIG: SR6Config;

	interface SR6Game extends Game<SR6Actor, Actors, SR6ChatMessage, SR6Combat, SR6Item, Macro, Scene, User> {
		dice3d?: Dice3d;
	}

	const TokenMagic: Maybe<TokenMagic>;

	const game: SR6Game;

	interface LoggerParams {
		type?: 'log' | 'trace' | 'warn' | 'info' | 'debug';
		inputs?: boolean;
		outputs?: boolean;
	}

	const defaultParams: Required<LoggerParams> = {
		type: 'log',
		inputs: true,
		outputs: true,
	};

	// Fucking foundry
	function fromUuid(uuid: CompendiumUUID, relative?: Maybe<ClientDocument>): Promise<CompendiumDocument | null>;
	function fromUuid(
		uuid: ActorUUID,
		relative?: Maybe<ClientDocument>,
	): Promise<Actor<TokenDocument<Scene> | null> | null>;
	function fromUuid(
		uuid: ItemUUID,
		relative?: Maybe<ClientDocument>,
	): Promise<Item<Actor<TokenDocument<Scene> | null>> | null>;
	function fromUuid(uuid: TokenDocumentUUID, relative?: Maybe<ClientDocument>): Promise<TokenDocument<Scene> | null>;
	function fromUuid<TDocument extends ClientDocument>(
		uuid: string,
		relative?: Maybe<ClientDocument>,
	): Promise<TDocument | null>;

	interface ElementDragEvent extends DragEvent {
		target: HTMLElement;
		currentTarget: HTMLElement;
		readonly dataTransfer: DataTransfer;
	}

	type DragEventData = {
		type: 'ActiveEffect' | 'Actor' | 'Item' | 'Folder';
		uuid: ItemUUID | ActorUUID | TokenDocumentUUID;
	};

	type DeepPartial<T> = {
		[P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
	};

	export type Maybe<T> = T | null | undefined;
}
