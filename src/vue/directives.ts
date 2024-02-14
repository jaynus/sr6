/**
 *
 * @author jaynus
 * @file Vue custom directives
 */
import SR6Actor from '@/actor/SR6Actor';
import BaseDataModel from '@/data/BaseDataModel';
import SR6Item from '@/item/SR6Item';
import { toRaw, DirectiveBinding } from 'vue';

function doLocalize(el: HTMLInputElement, binding: DirectiveBinding): void {
	if (typeof binding.arg !== 'string') {
		console.warn(`Attempt to localize non-string attribute '${binding.arg}'`);
		return;
	}

	if (typeof binding.value !== 'string' || binding.value.trim().length === 0) {
		console.warn(`Attempt to localize non-string or empty key '${binding.value}'`);
		return;
	}

	const localized = game.i18n.localize(<string>binding.value);

	(<string>binding.arg).split(',').forEach((attribute) => {
		el.setAttribute(attribute, localized);
	});
}

export const vLocalize = {
	beforeMount: doLocalize,
	updated: doLocalize,
};

export async function createNewItem(actor: SR6Actor, type: string): Promise<void> {
	await toRaw(actor).createEmbeddedDocuments('Item', [{ name: `new ${type}`, type: type }]);
}

export function getElementValue(src: HTMLElement): null | string | number | boolean {
	let value = null;

	if (src instanceof HTMLSelectElement) {
		const target = src as HTMLSelectElement;
		if (target.value !== '' && target.value !== 'null') {
			value = target.value;
		}
	} else {
		const target = src as HTMLInputElement;
		if (target.type === 'text') {
			value = target.value;
		} else if (target.type === 'checkbox') {
			value = target.checked;
		} else if (target.type === 'number') {
			value = parseInt(target.value);
		}
	}
	return value;
}

export function getEventValue(event: Event): null | string | number | boolean {
	if (event.target) {
		return getElementValue(event.target as HTMLElement);
	}
	return null;
}

export async function updateItem(actor: SR6Actor, id: string, field: string, event: Event): Promise<void>;
export async function updateItem(actor: SR6Actor, id: string, field: string, event: string): Promise<void>;
export async function updateItem(actor: SR6Actor, id: string, field: string, event: Event | string): Promise<void> {
	await toRaw(actor).updateEmbeddedDocuments('Item', [
		{
			_id: id,
			[field]: event instanceof Event ? getEventValue(event) : event,
		},
	]);
}

export async function deleteItem<TDataModel extends BaseDataModel = BaseDataModel>(
	item: SR6Item<TDataModel>,
	bypass_confirmation: boolean = false,
): Promise<boolean> {
	let confirmed = bypass_confirmation;
	if (!confirmed) {
		confirmed = await Dialog.confirm({
			title: 'Confirm delete?',
			content: `Are you sure you want to delete ${item.name}?`,
			yes: () => true,
			no: () => false,
		});
	}
	if (confirmed) {
		await item.delete();
		return true;
	}
	return false;
}

export async function pingActor(actor: SR6Actor): Promise<void> {
	const tokens = toRaw(actor).getActiveTokens();
	if (tokens.length > 0) {
		void canvas.ping(tokens[0].center);
		await canvas.animatePan(tokens[0].center);
	}
}
