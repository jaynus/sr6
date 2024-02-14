import SR6Actor from '@/actor/SR6Actor';
import BaseDataModel from '@/data/BaseDataModel';
import { DocumentUUIDField } from '@/data/fields';
import SR6Effect from '@/effect/SR6Effect';
import BaseItemDataModel from '@/item/data/BaseItemDataModel';
import GearDataModel from '@/item/data/gear/GearDataModel';
import SR6Item from '@/item/SR6Item';
import { getItemSync } from '@/util';
import { Result, Err, Ok } from 'ts-results';

export class LinkedItemEntryDataModel extends BaseDataModel {
	declare id: ItemUUID;
	declare slot: Maybe<string>;
	declare parent: SR6Item | SR6Actor | BaseDataModel;

	static defineSchema(): foundry.data.fields.DataSchema {
		const fields = foundry.data.fields;
		return {
			id: new DocumentUUIDField({ required: true, nullable: false }),
			slot: new fields.StringField({ required: false, initial: null, nullable: true }),
		};
	}

	constructor(
		data?: DeepPartial<SourceFromSchema<foundry.data.fields.DataSchema>>,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		options?: DataModelConstructionOptions<any>,
	) {
		super(data, options);
	}
}

export abstract class LinkedItemsDataModel extends BaseDataModel {
	protected abstract _items: LinkedItemEntryDataModel[];
	abstract slots: Maybe<string[]>;

	abstract path: string;

	get items(): SR6Item<BaseItemDataModel>[] {
		return this._items.map(
			(entry) => getItemSync(SR6Item<BaseItemDataModel>, entry.id)! as SR6Item<BaseItemDataModel>,
		);
	}

	get count(): number {
		return this._items.length;
	}

	get freeSlots(): Maybe<string[]> {
		if (!this.slots) {
			return undefined;
		}
		return this.slots.filter((slot) => !this._items.find((entry) => entry.slot === slot));
	}

	override applyActiveEffects(): void {
		super.applyActiveEffects();
		for (const linkedItem of this.items) {
			// copy attachment modifiers
			this.item!.modifiers.all = this.item!.modifiers.all.concat(linkedItem.modifiers.all);

			for (const effectData of linkedItem.effects) {
				const effect = effectData as SR6Effect;

				for (const change of effect.changes) {
					if (change.mode < 900) {
						// Change modes > 900 are modifiers, and we already copied those
						effect._apply(this.item!, change);
					}
				}
			}
		}
	}

	async link(
		item: SR6Item<BaseItemDataModel>,
		slot: Maybe<string> = undefined,
	): Promise<Result<Maybe<string>, string>> {
		if (!this.isOwner || !item.isOwner) {
			return Err(`User does not have permission: Child(${item.uuid}) Parent(${this.item!.uuid})`);
		}

		if (item.systemData._linkedTo) {
			return Err(`Cannot attach (${item.uuid})->(${this.item!.uuid}): Child was alread attached to something!`);
		}
		if (item.systemData._linkedTo! === this.item!.uuid) {
			return Err(`Item was already attached (${item.uuid})->(${this.item!.uuid}), returning true`);
		}

		if (this.slots && this.slots.length > 0 && !slot) {
			console.error('slot link failure [this.slots, slot]', this.slots, slot);
			return Err('Linking this item requires slots, but no slot specified');
		}

		if (this.slots && this.slots.length > 0 && !this.slots.includes(slot!)) {
			return Err('Invalid slot for linking');
		}

		if (this.slots && this._items.find((entry) => entry.slot === slot)) {
			return Err('Item already in slot');
		}

		this._items = [...this._items, new LinkedItemEntryDataModel({ id: item.uuid, slot }, { parent: this })];
		await this.item!.update({ [`${this.path}._items`]: this._items });

		// Update the child
		await item.update({ ['system._linkedTo']: this.item!.uuid });
		await item.toggleAllEffects(true);

		// await this._syncAttachmentEffects();

		return Ok(slot);
	}

	async unlink(item: SR6Item<BaseItemDataModel>): Promise<Result<null, string>> {
		if (!this.isOwner || !item.isOwner) {
			return Err(`User does not have permission:  Child(${item.uuid}) Parent(${this.item!.uuid})`);
		}

		if (
			!this._items.find((entry) => entry.id === item.uuid) ||
			item.systemData.linkedTo?.uuid !== this.item!.uuid
		) {
			return Err(`Item (${item.uuid}) was not attached to ${this.item!.uuid}`);
		}

		await this.item!.update({
			[`${this.path}._items`]: this._items.filter((entry) => entry.id !== item.uuid),
		});
		await item.toggleAllEffects(false);

		// Update the child
		await item.update({ ['system._linkedTo']: null });

		// await this._syncAttachmentEffects();

		return Ok(null);
	}

	async unlinkAll(): Promise<void> {
		for (const item of this.items) {
			await item.update({ ['system._linkedTo']: null });
		}
		this._items = [];
		await this.item!.update({
			[`${this.path}._items`]: [],
		});
	}

	async clean(): Promise<void> {
		const toRemove: string[] = [];
		this._items.forEach((entry) => {
			if (getItemSync(SR6Item<GearDataModel>, entry.id) === null) {
				toRemove.push(entry.id);
			}
		});
		if (toRemove.length > 0) {
			this._items = this._items.filter((entry) => toRemove.includes(entry.id) === false);
			await this.item!.update({ [`${this.path}._items`]: this._items });
		}
	}

	static defineSchema(): foundry.data.fields.DataSchema {
		const fields = foundry.data.fields;
		return {
			path: new fields.StringField({ initial: 'system' }),
			slots: new fields.ArrayField(new fields.StringField(), { required: false, initial: [], nullable: true }),
			_items: new fields.ArrayField(new fields.EmbeddedDataField(LinkedItemEntryDataModel), {
				initial: [],
				required: true,
				nullable: false,
			}),
		};
	}

	override prepareBaseData(): void {
		void this.clean();
	}
}
