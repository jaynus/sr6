/* eslint @typescript-eslint/no-explicit-any:0, @typescript-eslint/explicit-module-boundary-types:0 */
/**
 * FVTT-SR6
 * Unofficial implementation of the SR6 RPG for Foundry
 *
 * @author jaynus
 * @file Dice roll prompt app.
 */
import CharacterDataModel from '@/actor/data/CharacterDataModel';

import SR6Actor from '@/actor/SR6Actor';
import { ActivationType } from '@/data';
import BaseDataModel from '@/data/BaseDataModel';

import { MagicAwakenedType, MagicTradition } from '@/data/magic';
import {
	getCoreAdeptPowers,
	getCoreQualities,
	getCoreMatrixActions,
	getCoreSkills,
	getCoreWeapons,
	getCoreSpells,
	getCoreGeneralActions,
	getCoreGear,
	getCoreAugmentations,
	getCorePrograms,
} from '@/item/data';
import LifestyleType from '@/item/data/feature/LifestyleDataModel';
import SkillDataModel from '@/item/data/feature/SkillDataModel';
import SR6Item from '@/item/SR6Item';
import VueImportPrompt from '@/vue/apps/ImportPrompt.vue';
import { ContextBase } from '@/vue/SheetContext';
import VueSheet from '@/vue/VueSheet';
import { Err, Ok, Result } from 'ts-results';
import { Component } from 'vue';

export enum ImportAction {
	Skip,
	Replace,
	NoReplace,
	Merge,
	Fresh,
}

export const DefaultImportAction = ImportAction.Replace;

export type ImportResult = {};

export class ImportSettings {
	Attributes: ImportAction = DefaultImportAction;
	Qualities: ImportAction = DefaultImportAction;
	AdeptPowers: ImportAction = DefaultImportAction;
	Augmentations: ImportAction = DefaultImportAction;
	Skills: ImportAction = DefaultImportAction;

	Gear: ImportAction = DefaultImportAction;
	Weapons: ImportAction = DefaultImportAction;
	GeneralActions: ImportAction = DefaultImportAction;
	MatrixActions: ImportAction = DefaultImportAction;

	Lifestyles: ImportAction = DefaultImportAction;
	Contacts: ImportAction = DefaultImportAction;
	SINs: ImportAction = DefaultImportAction;
	Spells: ImportAction = DefaultImportAction;
}

export interface ImportPromptContext extends ContextBase {
	app: ImportPrompt;
}

function convertActivation(value: string): ActivationType {
	switch (value) {
		case 'PASSIVE':
			return ActivationType.Passive;
		case 'MAJOR_ACTION':
			return ActivationType.Major;
		case 'MINOR_ACTION':
			return ActivationType.Minor;
		default:
			ui.notifications.error(`Invalid activation type ${value}`);
			throw `Invalid activation type ${value}`;
	}
}

/*

"adeptPowers"
"age"
"armors"
"attributes"
"augmentations"
"closeCombatWeapons"
"complexForms"
"contacts"
"drones"
"echoes"
"freeKarma"
"gender"
"heat"
"initiation"
"initiatives"
"items"
"karma"
"licenses"
"lifestyles"
"longRangeWeapons"
"martialArts"
"matrixItems"
"metaType"
"metamagic"
"name"
"notes"
"nuyen"
"qualities"
"reputation"
"rituals"
"signatureManeuvers"
"sins"
"size"
"skills"
"spells"
"streetName"
"submersion"
"system"
"vehicles"
"version"
"weight"
 */

export class ImportPrompt extends VueSheet(Application) {
	settings: ImportSettings = new ImportSettings();
	actor: Maybe<SR6Actor<CharacterDataModel>>;

	_getItemType<TDataModel extends BaseDataModel>(type: string): SR6Item<TDataModel>[] {
		return this.actor!.items.filter((item) => item.type === type).map((i) => i as SR6Item<TDataModel>);
	}

	protected async _removeItemType(type: string) {
		for (const i of this.actor!.items.filter((i) => i.type === type)) {
			await i.delete();
		}
	}

	protected async _genericItemImport(all: SR6Item[], action: ImportAction): Promise<Result<ImportResult, string>> {
		if (all.length < 1) {
			return Ok({});
		}

		// assert that all items are of the same type
		const type = all[0].type;
		for (const item of all) {
			if (item.type !== type) {
				return Err('All items must be the same type');
			}
		}

		switch (action) {
			case ImportAction.Merge: {
				const newItems = [];
				for (const item of all) {
					const existing = this.actor!.items.getName(item.name);
					if (existing) {
						await existing.update({
							['system']: foundry.utils.mergeObject(existing.system, item.system, {
								inplace: false,
								enforceTypes: false,
								overwrite: true,
							}),
							['flags']: foundry.utils.mergeObject(existing.flags, item.flags, {
								inplace: false,
								enforceTypes: false,
								overwrite: true,
							}),
						});
					} else {
						newItems.push(item);
					}
				}
				await this.actor!.createEmbeddedDocuments('Item', newItems);
				break;
			}
			case ImportAction.NoReplace: {
				await this.actor!.createEmbeddedDocuments(
					'Item',
					all.filter((action) => !this.actor!.items.getName(action.name)),
				);
				break;
			}
			case ImportAction.Replace: {
				for (const action of all) {
					await this.actor!.items.getName(action.name)?.delete();
				}
				await this.actor!.createEmbeddedDocuments('Item', all);
				break;
			}
			case ImportAction.Fresh: {
				await this._removeItemType(all[0].type);
				await this.actor!.createEmbeddedDocuments('Item', all);
				break;
			}
		}

		return Ok({});
	}

	async attributes(json: any): Promise<Result<ImportResult, string>> {
		if (this.settings.Attributes === ImportAction.Skip) {
			return Ok({});
		}

		Object.keys(this.actor!.systemData.attributes).forEach((name: string) => {
			const value = json.attr(name);

			if (value !== undefined) {
				switch (this.settings.Attributes) {
					case ImportAction.NoReplace: {
						break;
					}
					case ImportAction.Merge:
					case ImportAction.Replace:
					case ImportAction.Fresh: {
						(this.actor!.systemData.attributes as any)[name].base = value.points;
						(this.actor!.systemData.attributes as any)[name].modifier = value.modifiedValue - value.points;
						break;
					}
				}
			} else {
				console.error(`missing attribute: ${name}`);
			}
		});

		return Ok({});
	}
	/*

	 */

	async qualities(json: any): Promise<Result<ImportResult, string>> {
		if (this.settings.Qualities === ImportAction.Skip) {
			return Ok({});
		}

		if (Object.prototype.hasOwnProperty.call(json, 'qualities') && json.qualities.length > 0) {
			const all = await getCoreQualities();
			return this._genericItemImport(
				json.qualities
					.map((value: any) => {
						const existing = all.find((i) => i.name === value.name);
						if (existing) {
							return existing;
						} else {
							switch (value.name) {
								case 'Adept': {
									this.actor!.systemData.magicAwakened = MagicAwakenedType.Adept;
									return null;
								}
								case 'Magician': {
									this.actor!.systemData.magicAwakened = MagicAwakenedType.Full;
									this.actor!.systemData.magicTradition = MagicTradition.Hermeticism;
									return null;
								}
								case 'Technomancer': {
									this.actor!.systemData.magicAwakened = MagicAwakenedType.Technomancer;
									return null;
								}
								default: {
									return {
										name: value.name,
										type: 'quality',
										img: 'icons/svg/item-bag.svg',
										system: {
											name: value.name,
											description: value.choice ? value.choice : '',
											source: value.page,
										},
									};
								}
							}
						}
					})
					.filter((p: any) => p !== null),
				this.settings.Qualities,
			);
		}

		return Ok({});
	}

	async adeptPowers(json: any): Promise<Result<ImportResult, string>> {
		if (this.settings.AdeptPowers === ImportAction.Skip) {
			return Ok({});
		}

		if (Object.prototype.hasOwnProperty.call(json, 'adeptPowers') && json.adeptPowers.length > 0) {
			const all = await getCoreAdeptPowers();

			return this._genericItemImport(
				json.adeptPowers.map((value: any) => {
					const existing = all.find((i: SR6Item) => i.name === value.name);
					if (existing) {
						return existing;
					} else {
						return {
							name: value.name,
							type: 'adeptpower',
							img: 'icons/svg/item-bag.svg',
							system: {
								source: value.page,
								powerCost: value.cost,
								level: value.level,
								activation: convertActivation(value.activation),
								description: value.description,
							},
						};
					}
				}),
				this.settings.AdeptPowers,
			);
		}

		return Ok({});
	}

	async augmentations(json: any): Promise<Result<ImportResult, string>> {
		if (this.settings.Augmentations === ImportAction.Skip) {
			return Ok({});
		}

		if (Object.prototype.hasOwnProperty.call(json, 'augmentations') && json.augmentations.length > 0) {
			const all = await getCoreAugmentations();
			return this._genericItemImport(
				json.augmentations
					.map((value: any) => {
						let name = value.name;
						let rating = 1;
						const arr = /(.*)Rating ([0-9])/g.exec(value.name);

						if (arr) {
							name = arr[1].trim();
							rating = parseInt(arr[2]);
						} else {
							rating = parseInt(value.level);
							if (isNaN(rating)) {
								rating = 1;
							}
						}

						const existing = all.find((i: SR6Item) => i.name.toLowerCase() === name.toLowerCase());
						if (existing) {
							return existing;
						} else {
							ui.notifications.warn(`Unknown Augmentation: ${name}, Attempting to parse`);
							let quality = 1;
							switch (value.quality) {
								case 'STANDARD':
									quality = 1;
									break;
								case 'ALPHA':
									quality = 2;
									break;
								case 'BETA':
									quality = 3;
									break;
							}
							return {
								name: value.name,
								type: 'augmentation',
								img: 'icons/svg/item-bag.svg',
								system: {
									name: value.name,
									essenceCost: value.essence,
									quality: quality,
									rating: rating,
									description: value.choice ? value.choice : '',
									source: value.page,
								},
							};
						}
					})
					.filter((p: any) => p !== null),
				this.settings.Augmentations,
			);
		}

		return Ok({});
	}

	async skills(json: any): Promise<Result<ImportResult, string>> {
		if (this.settings.Skills === ImportAction.Skip) {
			return Ok({});
		}

		const importResult = await this._genericItemImport(await getCoreSkills(), this.settings.Skills);
		if (!importResult.ok) {
			return importResult;
		}

		for (const skill of this._getItemType<SkillDataModel>('skill')) {
			const entry = json.skill(skill.name);
			if (entry) {
				const specialization: string | undefined = entry.specializations
					.filter((s: any) => !s.expertise)
					.map((s: any) => s.name)[0];
				const expertise: string | undefined = entry.specializations
					.filter((s: any) => s.expertise)
					.map((s: any) => s.name)[0];

				switch (this.settings.Skills) {
					case ImportAction.Fresh:
					case ImportAction.Replace:
					case ImportAction.Merge: {
						await skill.update({
							['system']: {
								points: parseInt(entry.rating),
								specialization: specialization ? specialization : null,
								expertise: expertise ? expertise : null,
							},
						});

						break;
					}
					case ImportAction.NoReplace: {
						break;
					}
				}
			}
		}

		// Knowledge and languages
		return this._genericItemImport(
			json.skills
				.map((jsonSkill: any) => {
					if (jsonSkill.id === 'knowledge' || jsonSkill.id === 'language') {
						return {
							name: jsonSkill.name,
							img: '/systems/sr6/assets/brain.webp',
							type: 'knowledge',
							system: {
								description: jsonSkill.description,
								category: jsonSkill.id,
								attribute: jsonSkill.attribute.toLowerCase(),
								points: jsonSkill.rating,
								specializations: [],
							},
						};
					}
					return null;
				})
				.filter((s: SR6Item | null) => s !== null),
			this.settings.Skills,
		);
	}

	async gear(json: any): Promise<Result<ImportResult, string>> {
		if (this.settings.Gear === ImportAction.Skip) {
			return Ok({});
		}

		const allGear = await getCoreGear();
		if (Object.prototype.hasOwnProperty.call(json, 'matrixItems') && json.matrixItems.length > 0) {
			const result = await this._genericItemImport(
				json.matrixItems
					.filter((value: any) => {
						const item = allGear.find((w) => w.name === value.name);
						if (!item) {
							ui.notifications.error!(`invalid matrix item: ${value.name}`);
							return false;
						}
						return true;
					})
					.map((value: any) => allGear.find((w) => w.name === value.name)),
				this.settings.Gear,
			);

			if (!result.ok) {
				return result;
			}
		}

		if (Object.prototype.hasOwnProperty.call(json, 'items') && json.items.length > 0) {
			const result = await this._genericItemImport(
				json.items.map((value: any) => {
					const item = allGear.find((w) => w.name.toLowerCase() === value.name.toLowerCase());
					if (item) {
						return item;
					} else {
						ui.notifications.warn!(`Couldnt find item: ${value.name}, attempting to create`);
						return {
							name: value.name,
							type: 'gear',
							img: 'icons/svg/item-bag.svg',
							system: {
								source: value.page,
								description: value.description,
								rating: value.rating,
								count: value.count,
								category: {
									type: value.type.toLowerCase(),
									subtype: value.subType.toLowerCase(),
								},
							},
						};
					}
				}),
				this.settings.Gear,
			);

			if (!result.ok) {
				return result;
			}
		}

		if (Object.prototype.hasOwnProperty.call(json, 'armors') && json.armors.length > 0) {
			const result = await this._genericItemImport(
				json.armors.map((value: any) => {
					const item = allGear.find((w) => {
						return w.name.toLowerCase() === value.name.toLowerCase();
					});
					if (item) {
						return item;
					} else {
						ui.notifications.warn!(`Couldnt find armor: ${value.name}, attempting to create`);

						let formulas = null;
						let slots = ['clothes'];
						if (value.rating > 0) {
							formulas = {
								defenseRatingFormula: value.rating.toString(),
							};
							slots = ['armor'];
						}

						return {
							name: value.name,
							type: 'wearable',
							img: 'icons/svg/item-bag.svg',
							system: {
								source: value.page,
								description: value.description,
								rating: 1,
								formulas: formulas,
								capacity: 0,
								slots: slots,
								category: {
									type: 'armor',
								},
							},
						};
					}
				}),
				this.settings.Gear,
			);

			if (!result.ok) {
				return result;
			}
		}

		return Ok({});
	}

	async weapons(json: any): Promise<Result<ImportResult, string>> {
		if (this.settings.Weapons === ImportAction.Skip) {
			return Ok({});
		}

		const coreWeapons = await getCoreWeapons();
		if (Object.prototype.hasOwnProperty.call(json, 'longRangeWeapons') && json.longRangeWeapons.length > 0) {
			const lrResult = await this._genericItemImport(
				json.longRangeWeapons
					.filter((value: any) => {
						const weapon = coreWeapons.find((w) => w.name === value.name);
						if (!weapon) {
							ui.notifications.error!(`invalid weapon: ${value.name}`);
							return false;
						}
						return true;
					})
					.map((value: any) => coreWeapons.find((w) => w.name === value.name)),
				this.settings.Weapons,
			);
			if (!lrResult.ok) {
				return lrResult;
			}
		}

		if (Object.prototype.hasOwnProperty.call(json, 'closeCombatWeapons') && json.closeCombatWeapons.length > 0) {
			return this._genericItemImport(
				json.closeCombatWeapons
					.filter((value: any) => {
						const weapon = coreWeapons.find((w) => w.name === value.name);
						if (!weapon) {
							ui.notifications.error!(`invalid weapon: ${value.name}`);
							return false;
						}
						return true;
					})
					.map((value: any) => coreWeapons.find((w) => w.name === value.name)),
				this.settings.Weapons,
			);
		}

		return Ok({});
	}

	async generalActions(_json: any): Promise<Result<ImportResult, string>> {
		if (this.settings.GeneralActions === ImportAction.Skip) {
			return Ok({});
		}
		return this._genericItemImport(await getCoreGeneralActions(), this.settings.GeneralActions);
	}

	async matrixActions(_json: any): Promise<Result<ImportResult, string>> {
		if (this.settings.MatrixActions === ImportAction.Skip) {
			return Ok({});
		}

		// TODO: this should be a seperate item
		const programsResult = await this._genericItemImport(await getCorePrograms(), this.settings.MatrixActions);
		if (!programsResult.ok) {
			return programsResult;
		}

		return this._genericItemImport(await getCoreMatrixActions(), this.settings.MatrixActions);
	}

	async lifestyles(json: any): Promise<Result<ImportResult, string>> {
		if (this.settings.Lifestyles === ImportAction.Skip) {
			return Ok({});
		}

		if (Object.prototype.hasOwnProperty.call(json, 'lifestyles') && json.lifestyles.length > 0) {
			const sins = this._getItemType('sin');

			return this._genericItemImport(
				json.lifestyles.map((value: any) => {
					let sin_id = null;
					if (value.sin && value.sin !== '') {
						const sin = sins.find((sin: any) => sin.name === value.sin);
						if (sin) {
							sin_id = sin.id;
						}
					}

					return {
						name: value.customName,
						type: 'lifestyle',
						img: 'icons/svg/item-bag.svg',
						system: {
							description: value.description,
							rating: LifestyleType[value.name as keyof typeof LifestyleType],
							monthsPaid: value.paidMonths,
							costFormula: value.cost,
							sin: sin_id,
						},
					};
				}),
				this.settings.Lifestyles,
			);
		}

		return Ok({});
	}

	async sins(json: any): Promise<Result<ImportResult, string>> {
		if (this.settings.SINs === ImportAction.Skip) {
			return Ok({});
		}

		if (Object.prototype.hasOwnProperty.call(json, 'sins') && json.sins.length > 0) {
			return this._genericItemImport(
				json.sins.map((value: any) => {
					return {
						name: value.name,
						type: 'sin',
						img: 'systems/sr6/assets/items/idcard.webp',
						system: {
							description: value.description !== undefined ? value.description : '',
							rating: value.quality,
						},
					};
				}),
				this.settings.SINs,
			);
		}

		return Ok({});
	}

	async contacts(json: any): Promise<Result<ImportResult, string>> {
		if (this.settings.Contacts === ImportAction.Skip) {
			return Ok({});
		}

		if (Object.prototype.hasOwnProperty.call(json, 'contacts') && json.contacts.length > 0) {
			return this._genericItemImport(
				json.contacts.map((value: any) => {
					return {
						name: value.name !== null ? value.name : '[No Name]',
						type: 'contact',
						img: 'systems/sr6/assets/items/idcard.webp',
						system: {
							description: value.description !== undefined ? value.description : '',
							rating: value.influence,
							loyalty: value.loyalty,
							type: value.type,
						},
					};
				}),
				this.settings.Contacts,
			);
		}

		return Ok({});
	}

	async spells(json: any): Promise<Result<ImportResult, string>> {
		if (this.settings.Spells === ImportAction.Skip) {
			return Ok({});
		}

		if (Object.prototype.hasOwnProperty.call(json, 'spells') && json.spells.length > 0) {
			const all = await getCoreSpells();
			return this._genericItemImport(
				json.spells
					.map((value: any) => {
						const existingSpell = all.find((i) => i.name === value.name);
						if (existingSpell) {
							return existingSpell;
						} else {
							ui.notifications.error(`Unknown spell: ${value.name}`);
							return null;
						}
					})
					.filter((p: any) => p !== null),
				this.settings.Spells,
			);
		}

		return Ok({});
	}

	async _onImportGenesisActor(file: string): Promise<void> {
		const response = await fetch(file);
		const json = await response.json();

		json.attr = (name: string): string => {
			return json.attributes.find((a: any) => a.id.toLowerCase() === name.toLowerCase());
		};
		json.skill = (name: string): string => {
			return json.skills.find((a: any) => a.id.toLowerCase() === name.toLowerCase());
		};

		if (!this.actor) {
			this.actor = (await Actor.create({
				name: json.streetName,
				type: 'character',
			})) as SR6Actor<CharacterDataModel>;
		}

		if (!this.actor) {
			ui.notifications!.error('import failed to create actor');
			return;
		}

		// Add all core actions
		await this.generalActions(json);
		await this.matrixActions(json);

		await this.attributes(json);

		await this.skills(json);

		await this.sins(json);
		await this.lifestyles(json);
		await this.contacts(json);

		await this.adeptPowers(json);
		await this.qualities(json);
		await this.augmentations(json);

		await this.spells(json);

		await this.weapons(json);

		await this.gear(json);

		await this.actor!.update({ ['system']: this.actor!.systemData });
		// await this.actor!.delete();

		ui.notifications.info(`Importing ${this.actor!.name} Complete`);
	}

	static override get defaultOptions(): ApplicationOptions {
		return {
			...super.defaultOptions,
			classes: ['app-import-prompt'],
			width: 500,
			height: 600,
			scroll: true,
		};
	}

	constructor(actor: Maybe<SR6Actor<CharacterDataModel>> = null) {
		super();
		this.actor = actor;
	}

	override async close(options: {} = {}): Promise<void> {
		return super.close(options);
	}

	get vueComponent(): Component {
		return VueImportPrompt;
	}

	async getVueContext(): Promise<ImportPromptContext> {
		return {
			app: this,
		};
	}
}
