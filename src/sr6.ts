/**
 *
 * @author jaynus
 * @file System Entry Point
 */

import { register as registerConfig, ready as readyConfigs } from '@/config';
import { register as registerCombat } from '@/combat';
import { register as registerEnrichers } from '@/enrichers';
import { register as registerHandlebarsHelpers, preload as preloadHandlebarsTemplates } from '@/handlebars';
import { register as registerItems, setOptGroups as registerItemOptGroups, onCreate as onCreateItem } from '@/item';
import { register as registerRolls } from '@/roll';
import { register as registerToken } from '@/token';
import { register as registerModifiers } from '@/modifier';
import { register as registerTests } from 'src/test';
import { register as registerFonts } from '@/fonts';
import { register as registerEdge } from '@/edge/';

import { onChatLogEntryContext } from '@/chat';

import { register as registerSettings } from '@/settings';

import { register as registerChat, renderChatLog } from '@/chat';

import { register as registerActors, onCreate as onCreateActor, setOptGroups as registerActorOptGroups } from '@/actor';
import { register as registerEffects } from '@/effect';

import { register as registerDisplayHelpers } from '@/display';

import { ImportPrompt } from '@/app/ImportPrompt';

import './scss/index.scss';

import { Logger } from 'tslog';

Hooks.on('renderChatLog', renderChatLog);

Hooks.once('init', async () => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(globalThis as any).log = new Logger({
		overwrite: {
			transportFormatted: (_logMetaMarkup: string, _logArgs: unknown[], _logErrors: string[]): void => {},
		},
	});

	// System Documents
	registerFonts();
	registerActors();
	registerItems();
	registerEffects();
	registerRolls();
	registerTests();

	// Misc. modules with one-time registrations
	registerCombat();
	registerEnrichers();
	registerHandlebarsHelpers();
	registerSettings();
	registerConfig();
	registerChat();
	registerToken();
	registerModifiers();
	registerEdge();
});

Hooks.once('ready', async () => {
	readyConfigs();
	registerDisplayHelpers();
	await preloadHandlebarsTemplates();
});

Hooks.on('createActor', async (actor: Actor, _controlled: boolean): Promise<void> => {
	return onCreateActor(actor);
});

Hooks.on('createItem', async (item: Item): Promise<void> => {
	return onCreateItem(item);
});

Hooks.on('renderDialog', (_dialog: Dialog, html: JQuery<HTMLElement>, _data: object): void => {
	const container = html[0];

	// Cheks if it's the item creation dialog and categorize the options from the dropdown
	if (container.classList.contains('dialog-item-create')) {
		const select = container.querySelector<HTMLSelectElement>('select[name=type]');

		if (select) {
			registerItemOptGroups(select);
			select.querySelector('option')!.selected = true;
		}

		// Cheks if it's the actor creation dialog and categorize the options from the dropdown
	} else if (container.classList.contains('dialog-actor-create')) {
		const select = container.querySelector<HTMLSelectElement>('select[name=type]');
		if (select) {
			registerActorOptGroups(select);
			select.querySelector('option')!.selected = true;
		}
	}
});

Hooks.on('renderActorDirectory', async (_app: ActorDirectory<Actor>, html: JQuery): Promise<void> => {
	const button = $("<button class='open-import-dialog'><i class='fas fa-edit'></i></i>Import</button>");

	button.click(async () => {
		await new ImportPrompt().render(true);
	});

	// Render Button
	$(html).find('.header-actions').append(button);
});

Hooks.on('getChatLogEntryContext', function (html: JQuery, data: ContextMenuEntry[]) {
	onChatLogEntryContext(html, data);
});
