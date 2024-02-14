import BaseDataModel from '@/data/BaseDataModel';
import { ConditionalData, ConditionalDataModel } from '@/effect/conditional';
import BaseModifier from '@/modifier/BaseModifier';
import { IModifier, ModifierSourceUUID, ModifierTarget } from '@/modifier/index';
import { Result } from 'ts-results';

export abstract class ModifierDataModel extends BaseDataModel {
	abstract class: string;

	abstract name: Maybe<string>;
	abstract description: Maybe<string>;

	abstract data: Maybe<object>;

	abstract conditions: ConditionalDataModel[];

	abstract target: ModifierTarget;

	create(
		parent: foundry.abstract.Document,
		source: Maybe<foundry.abstract.Document> = null,
	): Result<IModifier, string> {
		const data = {
			name: this.name || source?.name || (parent.name !== '' ? parent.name : '[No Name]'),
			description: this.description || '',
			...(this.data || {}),
		};

		return BaseModifier.fromData({
			class: this.class,
			parent: parent.uuid as ModifierSourceUUID,
			source: (source?.uuid as ModifierSourceUUID) || (parent.uuid as ModifierSourceUUID),
			target: this.target,
			conditions: this.conditions.length > 0 ? (this.conditions as ConditionalData[]) : undefined,
			...data,
		});
	}

	static defineSchema(): foundry.data.fields.DataSchema {
		const fields = foundry.data.fields;

		return {
			name: new fields.StringField({ required: false, blank: true, nullable: true }),
			description: new fields.StringField({ required: false, blank: true, nullable: true }),
			class: new fields.StringField({
				nullable: false,
				required: true,
				choices: Object.keys(CONFIG.sr6.types.modifiers),
			}),
			data: new fields.ObjectField({ initial: undefined, nullable: true, required: false }),
			target: new fields.StringField({
				initial: ModifierTarget.Actor,
				nullable: false,
				required: true,
				choices: Object.values(ModifierTarget),
			}),
			conditions: new fields.ArrayField(new fields.EmbeddedDataField(ConditionalDataModel), { initial: [] }),
		};
	}
}
