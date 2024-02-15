/**
 *
 * @author jaynus
 * @file Basic data model
 */

import BaseDataModel from '@/data/BaseDataModel';
import { DocumentUUIDField, EnumNumberField } from '@/data/fields';
import { MonitorDataModel } from '@/actor/data/MonitorsDataModel';
import { IHasLinks, IHasMatrix } from '@/data/interfaces';
import SkillUseDataModel from '@/data/SkillUseDataModel';
import SR6ActiveEffect from '@/effect/SR6ActiveEffect';
import BaseItemDataModel from '@/item/data/BaseItemDataModel';
import { MatrixAttributesDataModel } from '@/data/MatrixAttributesDataModel';
import { MatrixSimType } from '@/data/matrix';
import { LinkedItemsDataModel } from '@/item/data/LinkedItemsDataModel';
import ProgramDataModel from '@/item/data/ProgramDataModel';
import SR6Item from '@/item/SR6Item';
import { createModifiers } from '@/modifier';
import { ModifierDataModel } from '@/modifier/ModifierDataModel';
import { ITest } from '@/test';
import { Ok, Err, Result } from 'ts-results';

export enum GearSize {
	Large = 0,
	Bulky = 1,
	Tuckable = 2,
	Pocket = 3,
	Hand = 4,
	Slim = 5,
	Palmable = 6,
	Small = 7,
	Mini = 8,
	Fine = 9,
	Microscopic = 10,
}

export enum LicenseType {
	HeavyWeapon = 'heavyweapon',
	Firearm = 'firearm',
}

export enum GearType {
	Accessory = 'accessory',
	Armor = 'armor',
	Clothing = 'clothing',
	Bioware = 'bioware',
	Cyberware = 'cyberware',
	Tools = 'tools',
	Electronics = 'electronics',
	Nanoware = 'nanoware',
	Genetics = 'genetics',
	Weapon = 'weapon',
	Ammunition = 'ammunition',
	Chemicals = 'chemicals',
	Software = 'software',
	Survival = 'survival',
	Biology = 'biology',
	Magical = 'magical',
}

export type GearMonitors = {
	matrix: MonitorDataModel | null;
	physical: MonitorDataModel;
};

export type GearCategory = {
	type: GearType;
	subtype: string;
};

export type ProgramSlotsData = {
	total: number;
	available: number;
	programs: SR6Item<ProgramDataModel>[];
};

export abstract class GearWirelessBonusDataModel extends BaseDataModel {
	abstract description: string;
	abstract modifiers: ModifierDataModel[];
	abstract transfer: boolean;

	static defineSchema(): foundry.data.fields.DataSchema {
		const fields = foundry.data.fields;

		return {
			description: new fields.StringField({ initial: '', required: true, blank: true, nullable: false }),
			transfer: new fields.BooleanField({ initial: false, nullable: false, required: true }),
			modifiers: new fields.ArrayField(new fields.EmbeddedDataField(ModifierDataModel), {
				initial: [],
				required: true,
				nullable: false,
			}),
		};
	}
}

export abstract class GearMatrixDataModel extends BaseDataModel implements IHasLinks {
	abstract active: boolean;
	abstract wirelessBonus: GearWirelessBonusDataModel | null;
	abstract simModes: MatrixSimType[];
	abstract attributes: MatrixAttributesDataModel | null;
	abstract availableSlotsFormula: string;

	protected abstract _programs: LinkedItemsDataModel;

	async cleanLinks(): Promise<void> {
		await this._programs.clean();
	}

	get totalProgramSlots(): number {
		if (this.availableSlotsFormula) {
			return this.solveFormula(this.availableSlotsFormula);
		} else {
			return 0;
		}
	}

	get programSlots(): ProgramSlotsData {
		if (this.availableSlotsFormula) {
			const total = this.totalProgramSlots;
			return {
				total: total,
				available: total - this._programs.count,
				programs: this._programs.items as SR6Item<ProgramDataModel>[],
			};
		} else {
			return {
				total: 0,
				available: 0,
				programs: [],
			};
		}
	}

	async enableProgram(item: SR6Item<BaseItemDataModel>): Promise<Result<number, string>> {
		// Find an avaialable slot
		const freeSlots = this._programs.freeSlots;
		if (!freeSlots || freeSlots.length === 0) {
			return Err('no free program slots');
		}

		const res = await this._programs.link(item, freeSlots[0]);

		if (res.ok) {
			return Ok(freeSlots!.length - 1);
		} else {
			ui.notifications.error(`Failed to activate program: ${res.val}`);
			return Err(res.val);
		}
	}

	async disableProgram(item: SR6Item<BaseItemDataModel>): Promise<Result<null, string>> {
		return this._programs.unlink(item);
	}

	async clearPrograms(): Promise<void> {
		await this._programs.unlinkAll();
	}

	prepareSlots(): void {
		// Set slots as strings of the available total
		this._programs.slots = [...Array(this.totalProgramSlots).keys()].map((i) => i.toString());
	}

	override applyActiveEffects(): void {
		super.applyActiveEffects();
		this._programs.applyActiveEffects();
	}

	static defineSchema(): foundry.data.fields.DataSchema {
		const fields = foundry.data.fields;

		return {
			active: new fields.BooleanField({ initial: true, required: true, nullable: false }),
			wirelessBonus: new fields.EmbeddedDataField(GearWirelessBonusDataModel, {
				initial: null,
				required: true,
				nullable: true,
			}),
			simModes: new fields.ArrayField(
				new fields.StringField({
					blank: false,
					nullable: false,
					required: true,
					choices: Object.values(MatrixSimType),
				}),
				{ initial: [], required: true, nullable: false },
			),
			attributes: new fields.EmbeddedDataField(MatrixAttributesDataModel, {
				initial: null,
				required: true,
				nullable: true,
			}),
			availableSlotsFormula: new fields.StringField({
				initial: '0',
				blank: false,
				required: true,
				nullable: true,
			}),
			_programs: new fields.EmbeddedDataField(LinkedItemsDataModel, { required: true, nullable: false }),
		};
	}

	override prepareBaseData(): void {
		this.attributes?.prepareBaseData();
		this._programs.path = 'system.matrix._programs';
		this._programs.prepareBaseData();
	}

	override prepareData(): void {
		this.attributes?.prepareData();
		this.prepareSlots();
		this._programs.prepareData();
	}

	override prepareDerivedData(): void {
		this.attributes?.prepareDerivedData();
		this._programs.prepareDerivedData();
	}
}

export abstract class GearAvailabilityDataModel extends BaseDataModel {
	abstract illegal: boolean;
	abstract requiresLicense: boolean;
	abstract rating: number;

	abstract licensingSinId: Maybe<DocumentUUIDField>;

	static defineSchema(): foundry.data.fields.DataSchema {
		const fields = foundry.data.fields;

		return {
			illegal: new fields.BooleanField({ initial: false, required: true, nullable: false }),
			requiresLicense: new fields.BooleanField({ initial: false, required: true, nullable: false }),
			rating: new fields.NumberField({ initial: 1, nullable: false, required: true, min: 1 }),
			licensingSinId: new DocumentUUIDField({ required: false, nullable: true }),
		};
	}
}

export default abstract class GearDataModel extends BaseItemDataModel implements IHasMatrix, IHasLinks {
	abstract isProxy: boolean;

	abstract category: GearCategory;

	abstract rating: number;
	abstract size: GearSize;
	abstract costFormula: string;
	abstract availability: GearAvailabilityDataModel;

	abstract monitors: GearMonitors;

	abstract skillUse: SkillUseDataModel | null;

	abstract matrix: GearMatrixDataModel | null;

	// IHasMatrix
	matrixIcon(): Maybe<string> {
		return this.item?.img;
	}

	matrixWirelessActive(): boolean {
		return this.matrix?.active || false;
	}

	matrixRunningSilent(): boolean {
		// TODO:
		return false;
	}

	// Other

	get wirelessBonusName(): string {
		return `${this.item!.name} (Wireless Bonus)`;
	}

	async toggleWireless(): Promise<boolean> {
		if (!this.matrix) {
			return false;
		}

		this.matrix!.active = !this.matrix!.active;
		await this.item!.update({
			['system.matrix.active']: this.matrix!.active,
		});

		if (this.matrix!.active && this.matrix!.wirelessBonus) {
			// Create an active effect for us being active and add its modifiers and conditions
			const effect = (
				await this.item!.createEmbeddedDocuments('ActiveEffect', [
					{
						name: this.wirelessBonusName,
						description: this.matrix!.wirelessBonus.description,
						icon: this.item!.img,
						disabled: false,
						transfer: this.matrix!.wirelessBonus.transfer,
					},
				])
			)[0] as SR6ActiveEffect;

			if (this.matrix?.wirelessBonus?.modifiers) {
				await createModifiers(this.item!, effect, this.matrix!.wirelessBonus!.modifiers);
			}
		} else {
			// Remove the wireless bonus effect if it was present
			await this.item!.getEffectByName(this.wirelessBonusName)?.delete();
		}

		return this.matrix!.active;
	}

	get cost(): number {
		return this.solveFormula(this.costFormula);
	}

	defenseRating(_test: Maybe<ITest> = null): number {
		return 0;
	}

	get socialRating(): number {
		return 0;
	}

	override getRollData(): Record<string, unknown> {
		return {
			...super.getRollData(),
			rating: this.rating,
		};
	}

	// IHasLinks

	async cleanLinks(): Promise<void> {
		await this.matrix?.cleanLinks();
	}

	async link(_item: SR6Item<BaseItemDataModel>, _slot: Maybe<string>): Promise<Result<Maybe<string>, string>> {
		throw 'err';
	}

	async unlink(item: SR6Item<BaseItemDataModel>): Promise<Result<null, string>> {
		if (this.matrix) {
			return this.matrix!.disableProgram(item);
		}

		return Err('matrix not active');
	}

	override applyActiveEffects(): void {
		// Apply active program effects
		super.applyActiveEffects();
		this.matrix?.applyActiveEffects();
	}

	static override defineSchema(): foundry.data.fields.DataSchema {
		const fields = foundry.data.fields;

		return {
			...super.defineSchema(),
			isProxy: new fields.BooleanField({ initial: false, required: true, nullable: false }),
			category: new fields.SchemaField(
				{
					type: new fields.StringField({
						blank: true,
						nullable: true,
						required: false,
						choices: Object.values(GearType),
					}),
					subtype: new fields.StringField({ initial: '', required: false, nullable: false }),
				},
				{ required: true, nullable: false },
			),
			rating: new fields.NumberField({ initial: 1, nullable: false, required: true, min: 1, max: 6 }),
			costFormula: new fields.StringField({ initial: '0', nullable: false, required: true, blank: false }),
			availability: new fields.EmbeddedDataField(GearAvailabilityDataModel, { required: true, nullable: false }),
			size: new EnumNumberField({ initial: 0, nullable: false, required: true, min: 0 }),
			monitors: new fields.SchemaField(
				{
					matrix: new fields.EmbeddedDataField(MonitorDataModel, {
						initial: null,
						required: true,
						nullable: true,
					}),
					physical: new fields.EmbeddedDataField(MonitorDataModel, {
						initial: { damage: 0, max: 0, formula: '8 + ceil(@rating / 2)' },
						required: true,
						nullable: false,
					}),
				},
				{ required: true, nullable: false },
			),
			matrix: new fields.EmbeddedDataField(GearMatrixDataModel, {
				initial: null,
				required: true,
				nullable: true,
			}),
			skillUse: new fields.EmbeddedDataField(SkillUseDataModel, {
				initial: null,
				required: true,
				nullable: true,
			}),
		};
	}

	override prepareBaseData(): void {
		this.monitors.physical.prepareBaseData();
		this.monitors.matrix?.prepareBaseData();
		this.matrix?.prepareBaseData();
	}

	override prepareData(): void {
		this.monitors.physical.prepareData();
		this.monitors.matrix?.prepareData();
		this.matrix?.prepareData();
	}

	override prepareDerivedData(): void {
		this.monitors.physical.prepareDerivedData();
		this.monitors.matrix?.prepareDerivedData();
		this.matrix?.prepareDerivedData();
	}
}
