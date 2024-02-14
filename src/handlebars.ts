/**
 *
 * @author jaynus
 * @file
 */
import { getActorSync, getItemSync } from '@/util';
import SR6Actor from '@/actor/SR6Actor';
import SR6Item from '@/item/SR6Item';

export async function preload(): Promise<void> {
	// const templatePaths = [];
	// return loadTemplates(templatePaths);
}

export function register(): void {
	// Bullshit

	/** String Utilities */
	Handlebars.registerHelper('capitalize', /** @param {string} value */ (value: string) => value.capitalize());
	Handlebars.registerHelper('toLowerCase', /** @param {string} value */ (value: string) => value.toLowerCase());
	Handlebars.registerHelper('toUpperCase', /** @param {string} value */ (value: string) => value.toUpperCase());
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	Handlebars.registerHelper('concat', ((...values: any) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		values.filter((v: any) => typeof v === 'string').join('');
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	}) as any);
	Handlebars.registerHelper('split', /** @param {string} value */ (value: string) => value.split(' '));

	/** Math Utilities */
	Handlebars.registerHelper('gt', (lhs: number, rhs: number) => lhs > rhs);
	Handlebars.registerHelper('lt', (lhs: number, rhs: number) => lhs < rhs);
	Handlebars.registerHelper('gte', (lhs: number, rhs: number) => lhs >= rhs);
	Handlebars.registerHelper('lte', (lhs: number, rhs: number) => lhs <= rhs);

	Handlebars.registerHelper('ceil', (lhs: number) => Math.ceil(lhs));
	Handlebars.registerHelper('floor', (lhs: number) => Math.floor(lhs));
	Handlebars.registerHelper('min', (lhs: number, rhs: number) => Math.min(lhs, rhs));
	Handlebars.registerHelper('max', (lhs: number, rhs: number) => Math.max(lhs, rhs));

	Handlebars.registerHelper('add', (lhs: number, rhs: number) => lhs + rhs);
	Handlebars.registerHelper('sub', (lhs: number, rhs: number) => lhs - rhs);
	Handlebars.registerHelper('mul', (lhs: number, rhs: number) => lhs * rhs);
	Handlebars.registerHelper('div', (lhs: number, rhs: number) => lhs / rhs);
	Handlebars.registerHelper('min', (lhs: number, rhs: number) => Math.min(lhs, rhs));
	Handlebars.registerHelper('max', (lhs: number, rhs: number) => Math.max(lhs, rhs));
	Handlebars.registerHelper('abs', (lhs: number) => Math.abs(lhs));
	Handlebars.registerHelper('floor', (lhs: number) => Math.floor(lhs));
	Handlebars.registerHelper('toFixed', (lhs: number, fractionDigits: number) => lhs.toFixed(fractionDigits));

	/** Logic Utilities */
	Handlebars.registerHelper('and', (lhs: number | boolean, rhs: number | boolean) => lhs && rhs);
	Handlebars.registerHelper('or', (lhs: number | boolean, rhs: number | boolean) => lhs || rhs);
	Handlebars.registerHelper('not', (val: number | boolean) => !val);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	Handlebars.registerHelper('var', function (this: Record<string, unknown>, varName: string, varValue: any) {
		this[varName] = varValue;
	});

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	Handlebars.registerHelper('includes', function (collection: any[], value: any) {
		if (!collection) {
			return false;
		}
		return collection.includes(value);
	});

	Handlebars.registerHelper('showRollDefense', function (roller: SR6Actor, targets: SR6Actor[] | undefined | null) {
		if (roller) {
			if (roller.isOwner && !game.user.isGM) {
				return false;
			}
		} else {
			return true;
		}

		if (!targets || targets.length === 0 || game.user.isGM) {
			return true;
		}

		return targets.find((a) => a.isOwner) !== undefined;
	});

	Handlebars.registerHelper('getUserById', function (userId: string) {
		return game.users.find((user) => user.id === userId);
	});

	Handlebars.registerHelper('getActorById', function (actorId: ActorUUID) {
		return getActorSync(SR6Actor, actorId);
	});
	Handlebars.registerHelper('getActorsByIds', function (actorIds: ActorUUID[]) {
		return actorIds.map((id) => getActorSync(SR6Actor, id));
	});

	Handlebars.registerHelper('getItemById', function (itemId: ItemUUID) {
		return getItemSync(SR6Item, itemId);
	});

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	Handlebars.registerHelper('solveFormula', function (system: any, formula: string) {
		return system.solveFormula(formula);
	});

	/** Iteration utilities */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	Handlebars.registerHelper('repeat', (times: number, options: any) => {
		const results = [];

		for (let i = 0; i < times; i++) {
			results.push(options.fn(i));
		}

		return results.join('');
	});

	/** Functional utilities */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	Handlebars.registerHelper('undefined', /** @param {string} value */ (value: any) => value === undefined);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	Handlebars.registerHelper('null', /** @param {string} value */ (value: any) => value === null);
}
