/**
 *
 * @author jaynus
 * @file ActiveEffects Customizations
 */
import SR6Actor from '@/actor/SR6Actor';
import SR6Combat from '@/combat/SR6Combat';
import SR6Combatant from '@/combat/SR6Combatant';
import { IHasCombat } from '@/data/interfaces';
import { ConditionalData, checkConditions } from '@/effect/conditional';
import { BaseEffect, BaseEffectSourceData } from '@/effect/BaseEffect';
import BaseItemDataModel from '@/item/data/BaseItemDataModel';
import SR6Item from '@/item/SR6Item';
import { Modifiers, ModifiersSourceData, ModifierTarget } from '@/modifier';
import { AttackRatingModifier, PoolModifier } from '@/modifier/TestModifiers';

export const EFFECT_MODES = {
	POOL_MODIFIER: 900,
	ATTACK_RATING_MODIFIER: 901,
	...CONST.ACTIVE_EFFECT_MODES,
};

export enum EffectType {
	Standard = 'standard',
	OnHit = 'onhit',
	OnUse = 'onuse',
}

interface EffectFlags {
	type: EffectType;
	conditions?: ConditionalData[];
	modifiers?: ModifiersSourceData;
	effects?: BaseEffectSourceData[];
}

export default class SR6ActiveEffect extends ActiveEffect implements IHasCombat {
	modifiers: Modifiers<SR6ActiveEffect>;

	effects: BaseEffect[] = [];

	declare flags: {
		sr6?: EffectFlags;
	};

	failedConditions?: ConditionalData[];

	get systemData(): EffectFlags {
		return this.flags.sr6!;
	}

	get isConditional(): boolean {
		return this.systemData.conditions !== undefined;
	}

	get conditions(): ConditionalData[] | undefined {
		return this.systemData.conditions;
	}

	//
	// IHasCombat
	//
	combatantCreated?(combat: SR6Combat, combatant: SR6Combatant): void {
		this.effects.forEach((effect) => {
			(<IHasCombat>effect).combatantCreated?.(combat, combatant);
		});
	}

	async startCombat?(combat: SR6Combat, combatant: SR6Combatant): Promise<void> {
		for (const effect of this.effects) {
			await (<IHasCombat>effect).startCombat?.(combat, combatant);
		}
	}

	async endCombat?(combat: SR6Combat, combatant: SR6Combatant): Promise<void> {
		for (const effect of this.effects) {
			await (<IHasCombat>effect).endCombat?.(combat, combatant);
		}
	}

	async startTurn?(combat: SR6Combat, combatant: SR6Combatant): Promise<void> {
		for (const effect of this.effects) {
			await (<IHasCombat>effect).startTurn?.(combat, combatant);
		}
	}

	async endTurn?(combat: SR6Combat, combatant: SR6Combatant): Promise<void> {
		for (const effect of this.effects) {
			await (<IHasCombat>effect).endTurn?.(combat, combatant);
		}
	}

	override prepareBaseData(): void {
		this.modifiers = new Modifiers<SR6ActiveEffect>(this);
		if (this.flags.sr6?.effects) {
			this.effects = this.flags
				.sr6!.effects!.map((effectData) => BaseEffect.fromData(this, effectData))
				.filter((res) => res.ok)
				.map((res) => res.val as BaseEffect);
		}
	}

	override prepareData(): void {
		super.prepareData();

		if (!this.flags.sr6) {
			return;
		}

		if (this.parent) {
			if (this.parent instanceof SR6Item) {
				// this.disabled = this.parent.systemData.activation.status;
			}
		}

		this.failedConditions = undefined;
		if (this.conditions) {
			const origin = fromUuidSync(this.origin) as ClientDocument | null;
			const result = checkConditions(origin!, this.parent, this.conditions);
			if (!result.ok) {
				this.failedConditions = result.val;
				this.disabled = true;
			}
		}
	}

	static defaultFlags(): Record<string, unknown> {
		return {
			type: EffectType.Standard,
		};
	}

	protected override _preCreate(
		data: PreDocumentId<this['_source']>,
		options: DocumentModificationContext,
		user: User,
	): Promise<void> {
		const flags = {
			sr6: SR6ActiveEffect.defaultFlags(),
		};

		if (data.flags?.sr6) {
			foundry.utils.mergeObject(flags, data.flags, {
				overwrite: true,
				inplace: true,
			});
		}

		CONFIG.statusEffects
			.filter((status) => data.statuses?.includes(status.id))
			.forEach((activeStatus) => {
				if (activeStatus.flags) {
					foundry.utils.mergeObject(flags, activeStatus.flags as object, {
						inplace: true,
						overwrite: true,
					});
				}
			});

		this.updateSource({
			['flags.sr6']: flags,
		});

		return super._preCreate(data, options, user);
	}

	constructor(data: PreCreate<foundry.data.ActiveEffectSource>, context?: DocumentConstructionContext<ActiveEffect>) {
		super(data, context);

		if (context?.parent) {
			const originDescription =
				context?.parent instanceof SR6Item
					? (context?.parent as SR6Item<BaseItemDataModel>).systemData.description
					: '';
			if (!this.description || this.description === '') {
				this.description = originDescription;
			}
		}
		this.modifiers = new Modifiers(this);
	}

	override get isSuppressed(): boolean {
		return this.disabled;
	}

	override apply(actor: SR6Actor, change: ApplicableChangeData<this>): undefined | ApplicableChangeData<this> {
		return this._apply(actor, change);
	}

	override _applyCustom(
		_target: SR6Actor | SR6Item,
		_change: ApplicableChangeData<this>,
		_current: Record<string, unknown>,
		_delta: Record<string, unknown>,
		_changes: Record<string, unknown>,
	): void {}

	_applyPoolModifier(
		target: SR6Actor | SR6Item,
		change: ApplicableChangeData<this>,
		_current: Record<string, unknown>,
		_delta: Record<string, unknown>,
		_changes: Record<string, unknown>,
	): void {
		const testClasses = change.key.split(',');
		const value = parseInt(change.value);

		// Get modifier class
		target.modifiers.all.push(
			new PoolModifier({
				parent: target,
				source: this,
				target: ModifierTarget.Actor,
				data: {
					name: this.name,
					description: this.description,
					testClasses,
					value,
				},
			}),
		);
	}

	_applyAttackRatingModifier(
		target: SR6Actor | SR6Item,
		change: ApplicableChangeData<this>,
		_current: Record<string, unknown>,
		_delta: Record<string, unknown>,
		_changes: Record<string, unknown>,
	): void {
		const testClasses = change.key.split(',');
		const value = parseInt(change.value);

		// Get modifier class
		target.modifiers.all.push(
			new AttackRatingModifier({
				parent: target,
				source: this,
				target: ModifierTarget.Item,
				data: {
					name: this.name,
					description: this.description,
					testClasses,
					value,
				},
			}),
		);
	}

	_apply(document: SR6Actor | SR6Item, change: ApplicableChangeData<this>): undefined | ApplicableChangeData<this> {
		change = this._parseChanges(document, change);

		// Determine the data type of the target field
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const current: any = foundry.utils.getProperty(document, change.key) ?? null;
		let target = current;
		if (current === null) {
			if (target instanceof Actor) {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const model = (game as any).model.Actor[document.type] || {};
				target = foundry.utils.getProperty(model, change.key) ?? null;
			} else if (target instanceof Item) {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const model = (game as any).model.Item[document.type] || {};
				target = foundry.utils.getProperty(model, change.key) ?? null;
			}
		}
		const targetType = foundry.utils.getType(target);

		// Cast the effect change value to the correct type
		let delta;
		try {
			if (targetType === 'Array') {
				const innerType = target!.length ? foundry.utils.getType(target[0]) : 'string';
				delta = this._castArray(change.value, innerType);
			} else delta = this._castDelta(change.value, targetType);
		} catch (err) {
			console.warn(
				`Actor [${document.id}] | Unable to parse active effect change for ${change.key}: "${change.value}"`,
			);
			return undefined;
		}

		// const baseActor = actor as SR6Actor<BaseActorDataModel>;
		//  let actor = actor as SR6Actor<CharacterDataModel> as any;
		// const path = change.key.split(':');

		// Apply the change depending on the application mode
		const changes = {};
		switch (change.mode) {
			case EFFECT_MODES.ADD:
				this._applyAdd(document, change, current, delta, changes);
				break;
			case EFFECT_MODES.MULTIPLY:
				this._applyMultiply(document, change, current, delta, changes);
				break;
			case EFFECT_MODES.OVERRIDE:
				this._applyOverride(document, change, current, delta, changes);
				break;
			case EFFECT_MODES.UPGRADE:
			case EFFECT_MODES.DOWNGRADE:
				this._applyUpgrade(document, change, current, delta, changes);
				break;
			case EFFECT_MODES.CUSTOM:
				this._applyCustom(document, change, current, delta, changes);
				break;
			case EFFECT_MODES.POOL_MODIFIER:
				this._applyPoolModifier(document, change, current, delta, changes);
				break;
			case EFFECT_MODES.ATTACK_RATING_MODIFIER:
				this._applyAttackRatingModifier(document, change, current, delta, changes);
				break;
		}

		// Apply all changes to the Actor data
		foundry.utils.mergeObject(document, changes);

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return changes as any;
	}

	_parseChanges(document: SR6Actor | SR6Item, change: ApplicableChangeData<this>): ApplicableChangeData<this> {
		if (change.value.includes('@')) {
			if (this.parent instanceof SR6Item) {
				if (document instanceof SR6Actor) {
					change.value = (this.parent as SR6Item).solveFormula(change.value, document).toString();
				} else {
					change.value = (this.parent as SR6Item).solveFormula(change.value).toString();
				}
			} else if (this.parent instanceof SR6Actor) {
				change.value = (this.parent as SR6Actor).solveFormula(change.value).toString();
			}
		}

		return change;
	}
}
