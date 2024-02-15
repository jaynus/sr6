/**
 *
 * @author jaynus
 * @file Basic data model
 */

import BaseActorDataModel from '@/actor/data/BaseActorDataModel';
import SR6Actor from '@/actor/SR6Actor';
import { ActivationType } from '@/data';
import { ActivationDataModel } from '@/data/ActivationDataModel';
import BaseDataModel from '@/data/BaseDataModel';
import { DocumentUUIDField } from '@/data/fields';
import { IHasOnDelete, IHasPostCreate, IHasPreCreate } from '@/data/interfaces';
import SR6ActiveEffect from '@/effect/SR6ActiveEffect';
import QualityDataModel from '@/item/data/feature/QualityDataModel';
import SR6Item from '@/item/SR6Item';
import { ModifierDataModel } from '@/modifier/ModifierDataModel';
import { createModifiers } from '@/modifier';
import { getActorSync, getItemSync } from '@/util';

/**
 * Base data model shared by all Item documents.
 *
 * This class (and all subclasses) should be made abstract to deal with the way Foundry handles populating data for the schema.
 * By marking the class as abstract, TypeScript won't try to define the properties - which means Foundry is free to do as it wishes.
 * In this way, we can safely define the value types (to allow for typed access) on the data model. This works only because we never
 * have reason to instantiate any of the DataModel classes ourselves.
 */
export default abstract class BaseItemDataModel
	extends BaseDataModel
	implements IHasPostCreate, IHasPreCreate<SR6Item<BaseItemDataModel>>, IHasOnDelete<SR6Item<BaseItemDataModel>>
{
	abstract description: string;
	abstract source: string;

	abstract modifiers: ModifierDataModel[];
	abstract activation: ActivationDataModel;

	abstract _linkedTo: Maybe<ItemUUID | ActorUUID>;

	get attached(): boolean {
		return !!this._linkedTo;
	}

	get linkedTo(): null | SR6Actor<BaseDataModel> | SR6Item<BaseDataModel> {
		if (!this._linkedTo) {
			return null;
		}
		const parsed = parseUuid(this._linkedTo);
		if (parsed.documentType === 'Actor' && parsed.embedded.length === 0) {
			return getActorSync(SR6Actor<BaseActorDataModel>, this._linkedTo as ActorUUID);
		} else {
			return getItemSync(SR6Item<BaseDataModel>, this._linkedTo as ItemUUID);
		}
	}

	async setActive(status: boolean): Promise<void> {
		await this.item!.update({ ['system.activation.status']: status });

		if (status) {
			// activating, switch on our effects
			await this.item!.toggleAllEffects(true);
		} else {
			// deactivating, switch off our effects
			await this.item!.toggleAllEffects(false);
		}
	}

	async toggleActive(): Promise<boolean> {
		const status = !this.activation.status;
		await this.setActive(status);
		return status;
	}

	getEffect(): SR6ActiveEffect {
		// Either create our effect or find it
		const effect: Maybe<SR6ActiveEffect> = this.item!.effects.getName(this.item!.name) as
			| SR6ActiveEffect
			| undefined;
		if (!effect) {
			ui.notifications.error('Wtf we dont have an effect?');
			throw 'error';
		} else {
			return effect!;
		}
	}

	async createModifiers(): Promise<void> {
		await createModifiers(this.item!, this.getEffect(), this.modifiers);
	}

	onDelete(
		_document: SR6Item<QualityDataModel>,
		_options: DocumentModificationContext<SR6Item<QualityDataModel>>,
		_userId: string,
	): void {
		const linkedTo = this.linkedTo;
		if (linkedTo) {
			if (linkedTo instanceof SR6Item) {
				void linkedTo.unlinkItem(this.item! as SR6Item<BaseItemDataModel>);
			}
		}
	}

	async preCreate(
		document: SR6Item<BaseItemDataModel>,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		_data: PreDocumentId<any>,
		_options: DocumentModificationContext<SR6Item<BaseItemDataModel>>,
		_user: foundry.documents.BaseUser,
	): Promise<void> {
		const effect: Maybe<SR6ActiveEffect> = document.effects.getName(this.item!.name) as SR6ActiveEffect | undefined;
		if (!effect) {
			document.updateSource({
				['effects']: [
					{
						name: document.name,
						origin: this.item!.uuid,
						disabled: this.activation.type !== ActivationType.Passive,
						transfer: false,
					},
				],
			});
		}
	}

	async onPostCreate(): Promise<void> {
		await this.createModifiers();
	}

	override prepareBaseData(): void {
		super.prepareBaseData();
	}

	override prepareData(): void {
		super.prepareData();
		this.activation?.prepareData();

		this.modifiers.forEach((modifier) => {
			if (!modifier.name) {
				modifier.name = this.item!.name;
			}
			if (!modifier.description) {
				modifier.description = this.description;
			}
		});
	}

	override prepareDerivedData(): void {
		super.prepareDerivedData();
		this.activation?.prepareDerivedData();
	}

	override getRollData(): Record<string, unknown> {
		return {
			...super.getRollData(),
			item: this.item!,
		};
	}

	static defineSchema(): foundry.data.fields.DataSchema {
		const fields = foundry.data.fields;

		return {
			description: new fields.HTMLField(),
			source: new fields.StringField(),
			modifiers: new fields.ArrayField(new fields.EmbeddedDataField(ModifierDataModel), {
				initial: [],
				required: true,
				nullable: false,
			}),
			activation: new fields.EmbeddedDataField(ActivationDataModel, {
				required: true,
				nullable: false,
			}),
			_linkedTo: new DocumentUUIDField({ nullable: true }),
		};
	}

	static CHAT_TEMPLATE: string = 'systems/sr6/templates/chat/item.hbs';
	get chatTemplate(): string {
		return BaseItemDataModel.CHAT_TEMPLATE;
	}

	async toMessage(actor: SR6Actor | null = null): Promise<void> {
		const enrichedDescription = await TextEditor.enrichHTML(this.description, { async: true });

		let actorData = undefined;
		if (actor) {
			actorData = {
				name: actor?.name,
				img: actor?.img,
				uuid: actor?.uuid,
			};
		}

		const chatTemplate = await renderTemplate(this.chatTemplate, {
			name: this.item!.name,
			type: this.item!.type,
			description: enrichedDescription,
			img: this.item!.img,
			system: this.item!.systemData,
			actor: actorData,
		});
		await ChatMessage.create({
			user: game.user.id,
			speaker: {
				actor: game.user.character?.id,
			},
			content: chatTemplate,
			type: CONST.CHAT_MESSAGE_TYPES.OOC,
		});
	}
}
