import SR6Actor from '@/actor/SR6Actor';
import SR6Combat from '@/combat/SR6Combat';
import { ActivationPeriod, ActivationType, TargetString } from '@/data';
import BaseDataModel from '@/data/BaseDataModel';
import SR6Effect, { EffectType } from '@/effect/SR6Effect';
import BaseItemDataModel from '@/item/data/BaseItemDataModel';
import SR6Item from '@/item/SR6Item';
import { Err, Ok, Result } from 'ts-results';

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
			name: new fields.StringField({ required: true, blank: false, label: 'EFFECT.Name' }),
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

export abstract class ActionEffectDataModel extends BaseDataModel {
	abstract target: TargetString;
	abstract when: EffectType;
	abstract duplicates: boolean;
	abstract effect: ActiveEffectDataModel;

	hasEffect(actor: SR6Actor): boolean {
		return (
			actor.effects.find(
				(effect) =>
					effect.name === this.effect.name &&
					(effect.origin === this.item?.uuid || effect.origin === this.actor?.uuid),
			) !== undefined
		);
	}

	async apply(
		targets: Maybe<SR6Actor[]> = null,
		origin: Maybe<SR6Actor | SR6Item> = null,
	): Promise<Result<SR6Effect[], string>> {
		if (
			(this.target === TargetString.Target && (!targets || targets.length === 0)) ||
			(this.target === TargetString.Self && !this.actor)
		) {
			return Err('this action effect requires a target and/or self, and none was provided');
		}
		if (this.target === TargetString.Self) {
			targets = [this.actor!];
		}

		if (!origin) {
			origin = this.item || this.actor;
		}

		const effects: SR6Effect[] = [];
		for (const target of targets!) {
			// Dont re-apply the effect
			if (!this.duplicates && this.hasEffect(target)) {
				continue;
			}

			const data = (this.effect as foundry.abstract.DataModel).toObject();
			data.origin = origin?.uuid;
			data.description = data.description || (this.parent as BaseActionDataModel).description;

			effects.push(
				(
					await target!.createEmbeddedDocuments('ActiveEffect', [
						{
							data,
						},
					])
				)[0] as SR6Effect,
			);
		}

		return Ok(effects);
	}

	static defineSchema(): foundry.data.fields.DataSchema {
		const fields = foundry.data.fields;

		return {
			target: new fields.StringField({
				initial: TargetString.None,
				required: false,
				nullable: true,
				blank: false,
				choices: Object.values(TargetString),
			}),
			when: new fields.StringField({
				initial: EffectType.OnUse,
				required: false,
				nullable: true,
				blank: false,
				choices: Object.values(EffectType),
			}),
			duplicates: new fields.BooleanField({ initial: false }),
			effect: new fields.EmbeddedDataField(ActiveEffectDataModel, { required: true, nullable: false }),
		};
	}
}

export default abstract class BaseActionDataModel extends BaseItemDataModel {
	abstract effects: ActionEffectDataModel[];

	get available(): boolean {
		if (!game.combat) {
			return true;
		} else {
			const combat = game.combat! as SR6Combat;
			if (!combat.combatant) {
				return true;
			}

			// Are we in this combat? If not, allow action
			if (!combat.combatants.find((c) => c.uuid === this.actor!.uuid)) {
				return true;
			}

			// Is it our turn?
			if (
				this.activation.period === ActivationPeriod.Initiative &&
				combat.combatant!.actor.uuid !== this.actor!.uuid
			) {
				return false;
			}

			// Do we have enough actions?
			const combatData = combat.getCombatantData(this.actor!);
			if (!combatData) {
				return true;
			}
			switch (this.activation.type) {
				case ActivationType.Major: {
					return combatData.roundActions.major > 0;
				}
				case ActivationType.Minor: {
					return combatData.roundActions.minor > 0;
				}
				default: {
					ui.notifications.error('invalid action type for a consuming action?');
					return true;
				}
			}
		}
	}

	async use(
		_targets: Maybe<SR6Actor[]> = null,
		consumeAction: boolean = true,
		sendToChat: boolean = true,
	): Promise<Result<null, string>> {
		if (!this.actor) {
			return Err('Applying action error!?');
		}

		// Consume action if in combat
		if (consumeAction && game.combat) {
			const combatData = (game.combat! as SR6Combat).getCombatantData(this.actor!);
			if (combatData) {
				switch (this.activation.type) {
					case ActivationType.Major: {
						if (combatData.roundActions.major < 1) {
							return Err('No actions left to consume this');
						}
						combatData.roundActions.major -= 1;
						break;
					}
					case ActivationType.Minor: {
						if (combatData.roundActions.minor < 1) {
							return Err('No actions left to consume this');
						}
						combatData.roundActions.minor -= 1;
						break;
					}
					default: {
						return Err('invalid action type for a consuming action?');
					}
				}
				await (game.combat! as SR6Combat).setCombatantData(this.actor!, combatData);
			}
		}

		// Send action to chat
		if (sendToChat) {
			await this.toMessage(this.actor!);
		}

		return Ok(null);
	}

	async applyEffects(
		when: EffectType,
		targets: Maybe<SR6Actor[]> = null,
		origin: Maybe<SR6Actor | SR6Item> = null,
	): Promise<Result<SR6Effect[], string>> {
		let effects: SR6Effect[] = [];

		for (const effect of this.effects.filter((e) => e.when === when)) {
			const newEffect = await effect.apply(targets, origin);
			if (newEffect.ok) {
				effects = effects.concat(newEffect.val);
			} else {
				console.warn(`Failed to apply effect: ${newEffect.val}`, this);
			}
		}

		return Ok(effects);
	}

	static override defineSchema(): foundry.data.fields.DataSchema {
		const fields = foundry.data.fields;

		return {
			...super.defineSchema(),
			effects: new fields.ArrayField(new fields.EmbeddedDataField(ActionEffectDataModel), {
				initial: [],
				required: true,
				nullable: false,
			}),
		};
	}
}
