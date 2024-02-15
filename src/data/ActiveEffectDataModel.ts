import BaseDataModel from '@/data/BaseDataModel';

export abstract class ActiveEffectDataModel extends BaseDataModel {
	abstract name: string | undefined;
	abstract description: string | undefined;
	abstract duration: foundry.data.EffectDurationSource;
	abstract changes: foundry.data.EffectChangeSource[];
	abstract disabled: boolean;
	abstract icon: ImageFilePath;
	abstract tint: string;
	abstract origin: string | undefined;
	abstract transfer: boolean;
	abstract statuses: Set<string>;
	abstract flags: Record<string, unknown>;

	static defineSchema(): foundry.data.fields.DataSchema {
		const fields = foundry.data.fields;

		return {
			name: new fields.StringField({ initial: '[No Name]', required: true, blank: false, label: 'EFFECT.Name' }),
			changes: new fields.ArrayField(
				new fields.SchemaField({
					key: new fields.StringField({ required: true, label: 'EFFECT.ChangeKey' }),
					value: new fields.StringField({ required: true, label: 'EFFECT.ChangeValue' }),
					mode: new fields.NumberField({
						integer: true,
						initial: CONST.ACTIVE_EFFECT_MODES.ADD,
						label: 'EFFECT.ChangeMode',
					}),
					priority: new fields.NumberField(),
				}),
			),
			disabled: new fields.BooleanField(),
			duration: new fields.SchemaField({
				startTime: new fields.NumberField({ initial: null, label: 'EFFECT.StartTime' }),
				seconds: new fields.NumberField({ integer: true, min: 0, label: 'EFFECT.DurationSecs' }),
				rounds: new fields.NumberField({ integer: true, min: 0 }),
				turns: new fields.NumberField({ integer: true, min: 0, label: 'EFFECT.DurationTurns' }),
				startRound: new fields.NumberField({ integer: true, min: 0 }),
				startTurn: new fields.NumberField({ integer: true, min: 0, label: 'EFFECT.StartTurns' }),
			}),
			description: new fields.HTMLField({ label: 'EFFECT.Description' }),
			icon: new fields.FilePathField({ categories: ['IMAGE'], label: 'EFFECT.Icon' }),
			origin: new fields.StringField({ nullable: true, blank: false, initial: null, label: 'EFFECT.Origin' }),
			tint: new fields.ColorField({ label: 'EFFECT.IconTint' }),
			transfer: new fields.BooleanField({ initial: false, label: 'EFFECT.Transfer' }),
			statuses: new fields.SetField(new fields.StringField({ required: true, blank: false })),
			flags: new fields.ObjectField(),
		};
	}
}
