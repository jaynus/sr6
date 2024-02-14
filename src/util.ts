import SR6Actor from '@/actor/SR6Actor';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ConstructorOf<T> = new (...args: any[]) => T;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AbstractConstructorOf<T> = abstract new (...args: any[]) => T;

export const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

export function constructOptGroup(
	select: HTMLSelectElement,
	groupLabel: string,
	optValues?: string[],
): HTMLOptGroupElement {
	const options = select.querySelectorAll<HTMLOptionElement>(':scope > option');
	const optgroup = document.createElement('optgroup');

	optgroup.label = groupLabel;
	optgroup.append(...Array.from(options).filter((option) => !optValues || optValues.includes(option.value)));

	return optgroup;
}

export function toSnakeCase(string: string): string {
	return string
		.replace(/\W+/g, ' ')
		.split(/ |\B(?=[A-Z])/)
		.map((word) => word.toLowerCase())
		.join('_');
}

export async function getActor<TActor extends Actor>(
	documentClass: ConstructorOf<TActor>,
	id: ActorUUID,
): Promise<null | TActor> {
	const actor = await fromUuid(id);
	if (actor instanceof documentClass) {
		return actor as TActor;
	}
	return null;
}

export function getActorSync<TActor extends Actor>(documentClass: ConstructorOf<TActor>, id: ActorUUID): null | TActor {
	const actor = fromUuidSync(id);
	if (actor instanceof documentClass) {
		return actor as TActor;
	}
	return null;
}

export function getItemSync<TItem extends Item>(documentClass: ConstructorOf<TItem>, id: ItemUUID): null | TItem {
	const item = fromUuidSync(id);

	if (item instanceof documentClass) {
		return item as TItem;
	}
	return null;
}

export async function getItem<TItem extends Item>(
	documentClass: ConstructorOf<TItem>,
	id: ItemUUID,
): Promise<null | TItem> {
	const item = fromUuid(id);

	// if (item instanceof documentClass) {
	//	 return item as TItem;
	// }
	return item as unknown as TItem;
}

export async function waitForCanvasTokens(): Promise<void> {
	while (!canvas.ready) {
		await new Promise((resolve) => setTimeout(resolve, 250));
	}
}

/// /
export function getSelfOrSelectedActors(): SR6Actor[] {
	let actors: SR6Actor[] = [];

	if ((game as Game).user!.isGM) {
		actors = getSelectedActors();
	} else {
		actors = [getSelfActor()];
	}

	return actors;
}

export function getSelfActor(): SR6Actor {
	return (game as Game).user!.character as SR6Actor;
}

export function getSelectedActors(): SR6Actor[] {
	return getSelectedTokens()
		.filter((token) => token.actor !== null)
		.map((token) => {
			return token.actor as SR6Actor;
		});
}

export function getSelectedTokens(): Token[] {
	const canvas_tokens = canvas.tokens;
	if (!canvas_tokens) {
		return [];
	}

	return canvas_tokens.controlled;
}

export function getTargetTokens(): Token[] {
	return Array.from(game.user.targets);
}

export function getTargetActors(): SR6Actor[] {
	return Array.from(game.user.targets).map((token) => {
		return token.actor! as SR6Actor;
	});
}
export function getTargetActorIds(): ActorUUID[] {
	return Array.from(game.user.targets).map((token) => {
		return token.actor!.uuid as ActorUUID;
	});
}

export function enumKeys<O extends object, K extends keyof O = keyof O>(obj: O): K[] {
	return Object.keys(obj).filter((k) => !Number.isNaN(k)) as K[];
}

export function isAlphaNumeric(str: string): boolean {
	const len: number = str.length;

	for (let i = 0; i < len; i++) {
		const code = str.charCodeAt(i);
		if (
			!(code > 47 && code < 58) && // numeric (0-9)
			!(code > 64 && code < 91) && // upper alpha (A-Z)
			!(code > 96 && code < 123)
		) {
			// lower alpha (a-z)
			return false;
		}
	}
	return true;
}

export function isAlpha(str: string): boolean {
	const len: number = str.length;

	for (let i = 0; i < len; i++) {
		const code = str.charCodeAt(i);
		if (
			!(code > 64 && code < 91) && // upper alpha (A-Z)
			!(code > 96 && code < 123)
		) {
			// lower alpha (a-z)
			return false;
		}
	}
	return true;
}
