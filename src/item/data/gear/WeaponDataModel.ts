/**
 *
 * @author jaynus
 * @file Player Character
 */

import BaseDataModel from '@/data/BaseDataModel';
import { IHasLinks } from '@/data/interfaces';
import { AmmoStorageType, AmmoType } from '@/item/data/AmmoDataModel';
import BaseItemDataModel from '@/item/data/BaseItemDataModel';
import GearDataModel from '@/item/data/gear/GearDataModel';
import { DamageType, FireMode, Distance } from '@/data';
import { LinkedItemsDataModel } from '@/item/data/LinkedItemsDataModel';
import SR6Item from '@/item/SR6Item';

import { Result } from 'ts-results';

export abstract class AttackRatingDataModel extends BaseDataModel {
	abstract closeFormula: string;
	abstract nearFormula: string;
	abstract mediumFormula: string;
	abstract farFormula: string;
	abstract extremeFormula: string;

	get close(): number {
		return this.solveFormula(this.closeFormula);
	}

	get near(): number {
		return this.solveFormula(this.nearFormula);
	}

	get medium(): number {
		return this.solveFormula(this.mediumFormula);
	}

	get far(): number {
		return this.solveFormula(this.farFormula);
	}

	get extreme(): number {
		return this.solveFormula(this.extremeFormula);
	}

	atDistance(distance: Distance): number {
		switch (distance) {
			case Distance.Close: {
				return this.close;
			}
			case Distance.Near: {
				return this.near;
			}
			case Distance.Medium: {
				return this.medium;
			}
			case Distance.Far: {
				return this.far;
			}
			case Distance.Extreme: {
				return this.extreme;
			}
		}
		return 0;
	}

	static defineSchema(): foundry.data.fields.DataSchema {
		const fields = foundry.data.fields;

		return {
			closeFormula: new fields.StringField({ initial: '0', required: true, nullable: false }),
			nearFormula: new fields.StringField({ initial: '0', required: true, nullable: false }),
			mediumFormula: new fields.StringField({ initial: '0', required: true, nullable: false }),
			farFormula: new fields.StringField({ initial: '0', required: true, nullable: false }),
			extremeFormula: new fields.StringField({ initial: '0', required: true, nullable: false }),
		};
	}
}

export type WeaponDamage = {
	damageFormula: string;
	defenseFormula: string;
	soakFormula: string;
	damageType: DamageType;
};

export abstract class AmmoStorageDataModel extends BaseDataModel {
	static defineSchema(): foundry.data.fields.DataSchema {
		const fields = foundry.data.fields;

		return {
			type: new fields.StringField({
				initial: AmmoType.Light,
				required: true,
				nullable: false,
				blank: false,
				choices: Object.values(AmmoType),
			}),
			storageType: new fields.StringField({
				initial: AmmoStorageType.Clip,
				required: true,
				nullable: false,
				blank: false,
				choices: Object.values(AmmoStorageType),
			}),
			capacity: new fields.NumberField({ positive: true, integer: true }),
		};
	}
}

export default abstract class WeaponDataModel extends GearDataModel implements IHasLinks {
	abstract attackRatings: AttackRatingDataModel;

	abstract damageData: WeaponDamage;

	abstract firemodes: FireMode[];

	abstract ammo: Maybe<AmmoStorageDataModel>;

	abstract _accessories: LinkedItemsDataModel;

	get isMelee(): boolean {
		return this.firemodes.length < 1 || this.attackRatings.near === 0;
	}

	override prepareBaseData(): void {
		super.prepareBaseData();
		this.attackRatings.prepareBaseData();
		this._accessories.path = 'system._accessories';
		this._accessories.prepareBaseData();
	}

	override prepareData(): void {
		super.prepareData();
		this.attackRatings.prepareData();
		this._accessories.prepareData();
	}

	override prepareEmbeddedDocuments(): void {
		super.prepareEmbeddedDocuments();
		this.attackRatings.prepareEmbeddedDocuments();
		this._accessories.prepareEmbeddedDocuments();
	}

	override prepareDerivedData(): void {
		super.prepareDerivedData();
		this.attackRatings.prepareDerivedData();
	}

	get accessories(): SR6Item<GearDataModel>[] {
		return this._accessories.items as SR6Item<GearDataModel>[];
	}

	get damage(): number {
		return this.solveFormula(this.damageData.damageFormula);
	}

	get pool(): number {
		return this.skillUse ? this.skillUse!.pool : 0;
	}

	override applyActiveEffects(): void {
		super.applyActiveEffects();
		this._accessories.applyActiveEffects();
	}

	override async cleanLinks(): Promise<void> {
		await super.cleanLinks();
		await this._accessories.clean();
	}

	override async link(
		_item: SR6Item<BaseItemDataModel>,
		_slot: Maybe<string>,
	): Promise<Result<Maybe<string>, string>> {
		throw 'err';
	}

	override async unlink(item: SR6Item<BaseItemDataModel>): Promise<Result<null, string>> {
		if (this._accessories.items.find((i) => i.uuid === item.uuid)) {
			return this._accessories.unlink(item);
		}
		return super.unlink(item);
	}

	async attachAccessory(accessory: SR6Item<GearDataModel>): Promise<Result<Maybe<string>, string>> {
		return this._accessories.link(accessory);
	}

	async detachAccessory(accessory: SR6Item<GearDataModel>): Promise<Result<null, string>> {
		return this._accessories.unlink(accessory);
	}

	static override defineSchema(): foundry.data.fields.DataSchema {
		const fields = foundry.data.fields;

		return {
			...super.defineSchema(),
			attackRatings: new fields.EmbeddedDataField(AttackRatingDataModel, { required: true, nullable: false }),
			damageData: new fields.SchemaField(
				{
					damageFormula: new fields.StringField({ initial: '0', required: true, nullable: false }),
					defenseFormula: new fields.StringField({
						initial: '@agility + @intuition',
						required: true,
						nullable: false,
					}),
					soakFormula: new fields.StringField({
						initial: '@body',
						required: true,
						nullable: false,
					}),
					damageType: new fields.StringField({
						initial: DamageType.Physical,
						required: true,
						nullable: false,
						blank: false,
						choices: Object.values(DamageType),
					}),
				},
				{ required: true, nullable: false },
			),
			firemodes: new fields.ArrayField(
				new fields.StringField({ blank: false, choices: Object.values(FireMode) }),
				{ initial: [], required: true, nullable: true },
			),
			_accessories: new fields.EmbeddedDataField(LinkedItemsDataModel, { nullable: false, required: true }),
			ammo: new fields.EmbeddedDataField(AmmoStorageDataModel, {
				initial: null,
				nullable: true,
				required: false,
			}),
		};
	}
}
