import { SR6ChatMessage } from '@/chat/SR6ChatMessage';
import BaseItemDataModel from '@/item/data/BaseItemDataModel';
import SR6Item from '@/item/SR6Item';
import { getItem } from '@/util';

export {};

export function register(): void {
	CONFIG.ChatMessage.documentClass = SR6ChatMessage;
}

export async function renderChatLog(
	_chatlog: ChatLog,
	html: JQuery<HTMLElement>,
	_data: Record<string, unknown>,
): Promise<void> {
	html.on('drop', async (ev: JQuery.Event) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const data = TextEditor.getDragEventData((ev as any).originalEvent) as DragEventData;
		if (data.type !== 'Item') {
			return;
		}
		const item = await getItem(SR6Item<BaseItemDataModel>, data.uuid as ItemUUID);
		if (item) {
			await item.systemData.toMessage();
		}
	});
}

export function onChatLogEntryContext(_html: JQuery, _data: ContextMenuEntry[]): void {}
