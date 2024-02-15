/**
 *
 * @author jaynus
 * @file Base SR6 Item
 */
import SR6Actor from '@/actor/SR6Actor';
import SR6Combat from '@/combat/SR6Combat';
import SR6Combatant from '@/combat/SR6Combatant';
import BaseDataModel from '@/data/BaseDataModel';
import {
	IHasCombat,
	IHasLinks,
	IHasMatrix,
	IHasModifiers,
	IHasOnDelete,
	IHasOnUpdate,
	IHasPostCreate,
	IHasPreCreate,
	IHasSystemData,
} from '@/data/interfaces';
import SR6ActiveEffect from '@/effect/SR6ActiveEffect';
import BaseItemDataModel from '@/item/data/BaseItemDataModel';
import { Modifiers, ModifiersSourceData, ModifierTarget } from '@/modifier';
import FormulaRoll from '@/roll/FormulaRoll';
import * as util from '@/util';
import { Err, Result } from 'ts-results';
import SR6Effect from '../../lib/effect/SR6Effect';

export interface SR6ItemFlags {
	modifiers?: ModifiersSourceData;
}

/**
 * Item class used as a base for all SR6 items.
 */
export default class SR6Item<ItemDataModel extends BaseDataModel = BaseDataModel>
	extends Item<SR6Actor>
	implements IHasSystemData, IHasModifiers, IHasMatrix, IHasCombat
{
	overrides: Record<string, unknown> = {};
	modifiers: Modifiers<SR6Item<ItemDataModel>> = new Modifiers(this);

	// IHasMatrix
	matrixIcon(): Maybe<string> {
		return (<IHasMatrix>this.systemData).matrixIcon?.();
	}

	matrixWirelessActive(): boolean {
		return (<IHasMatrix>this.systemData).matrixWirelessActive?.() || false;
	}

	matrixRunningSilent(): boolean {
		return (<IHasMatrix>this.systemData).matrixRunningSilent?.() || false;
	}

	// IHasCombat
	combatantCreated(combat: SR6Combat, combatant: SR6Combatant): void {
		(<IHasCombat>this.systemData).combatantCreated?.(combat, combatant);
		this.effects.forEach((effect) => (effect as SR6ActiveEffect).combatantCreated?.(combat, combatant));
	}
	async startCombat(combat: SR6Combat, combatant: SR6Combatant): Promise<void> {
		await (<IHasCombat>this.systemData).startCombat?.(combat, combatant);
		for (const effect of this.effects) {
			await (effect as SR6ActiveEffect).startCombat?.(combat, combatant);
		}
	}

	async endCombat(combat: SR6Combat, combatant: SR6Combatant): Promise<void> {
		await (<IHasCombat>this.systemData).endCombat?.(combat, combatant);
		for (const effect of this.effects) {
			await (effect as SR6ActiveEffect).endCombat?.(combat, combatant);
		}
	}

	async startTurn(combat: SR6Combat, combatant: SR6Combatant): Promise<void> {
		await (<IHasCombat>this.systemData).startTurn?.(combat, combatant);
		for (const effect of this.effects) {
			await (effect as SR6ActiveEffect).startTurn?.(combat, combatant);
		}
	}

	async endTurn(combat: SR6Combat, combatant: SR6Combatant): Promise<void> {
		await (<IHasCombat>this.systemData).endTurn?.(combat, combatant);
		for (const effect of this.effects) {
			await (effect as SR6ActiveEffect).endTurn?.(combat, combatant);
		}
	}

	//

	get systemFlags(): undefined | SR6ItemFlags {
		return this.flags['sr6'] as SR6ItemFlags;
	}

	get safe_name(): string {
		return util.toSnakeCase(this.name);
	}

	getSystemData(): BaseDataModel {
		return this.systemData;
	}

	async toggleAllEffects(enabled: boolean): Promise<void> {
		await this.updateEmbeddedDocuments(
			'ActiveEffect',
			Array.from(
				this.effects
					.map((effect) => effect as SR6ActiveEffect)
					.map((effect) => {
						return { _id: effect.id, disabled: !enabled };
					}),
			),
		);
	}

	getEffectByName(name: string): Maybe<SR6ActiveEffect> {
		return this.effects.find((effect) => effect.name === name) as SR6ActiveEffect | undefined;
	}

	/**
	 * Specialized property for accessing `item.system` in a typed manner.
	 */
	get systemData(): ItemDataModel {
		return <ItemDataModel>this.system;
	}

	solveFormula(formula: string, actor: SR6Actor | null = null, data: Record<string, unknown> = {}): number {
		const roll = new FormulaRoll(formula, {
			...this.getRollData(),
			...actor?.getRollData(),
			...data,
			item: this.getRollData(),
			actor: actor,
		});

		return roll.evaluate({ async: false }).total;
	}

	allApplicableEffects(): SR6ActiveEffect[] {
		return this.effects.filter((e) => !(e as SR6Effect).disabled).map((e) => e as SR6ActiveEffect);
	}

	async cleanLinks(): Promise<void> {
		await (<IHasLinks>this.systemData).cleanLinks?.();
	}

	async linkItem(item: SR6Item<BaseItemDataModel>, slot: Maybe<string>): Promise<Result<Maybe<string>, string>> {
		if ((<IHasLinks>this.systemData).link) {
			return (<IHasLinks>this.systemData).link!(item, slot);
		} else {
			return Err('not a linkable item');
		}
	}

	async unlinkItem(item: SR6Item<BaseItemDataModel>): Promise<Result<null, string>> {
		if ((<IHasLinks>this.systemData).unlink) {
			return (<IHasLinks>this.systemData).unlink!(item);
		} else {
			return Err('not a linkable item');
		}
	}

	async cycleActiveEffects(): Promise<void> {
		const toDelete: string[] = [];
		this.effects.forEach((effect) => {
			const e = effect as SR6ActiveEffect;
			if (e.isTemporary && e.duration.remaining !== null && e.duration.remaining < 1) {
				toDelete.push(effect.id);
			}
		});

		for (const itemId of toDelete) {
			await this.effects.get(itemId)!.delete();
		}
	}
	applyActiveEffects(): void {
		// console.log('SR6Item::applyActiveEffects', this.name);
		const overrides = {};

		// Organize non-disabled effects by their application priority
		const changes = [];
		for (const effect of this.allApplicableEffects()) {
			if (!effect.active) continue;
			changes.push(
				...effect.changes.map((change) => {
					const c = foundry.utils.deepClone(change);
					c.effect = effect;
					c.priority = c.priority ?? c.mode * 10;
					return c;
				}),
			);

			effect.modifiers.all.forEach((mod) => {
				switch (mod.target) {
					case ModifierTarget.Item:
						this.modifiers.all.push(mod);
						break;
					case ModifierTarget.Actor:
						if (this.actor) {
							this.actor.modifiers.all.push(mod);
						}
				}
			});
		}
		changes.sort((a, b) => a.priority - b.priority);

		// Apply all changes
		for (const change of changes) {
			if (!change.key) continue;
			const changes = change.effect._apply(this, change);
			Object.assign(overrides, changes);
		}

		// Expand the set of final overrides
		this.overrides = foundry.utils.expandObject(overrides);

		this.systemData.applyActiveEffects();
	}

	override prepareEmbeddedDocuments(): void {
		super.prepareEmbeddedDocuments();
		if (this.systemData?.prepareEmbeddedDocuments) {
			this.systemData.prepareEmbeddedDocuments();
		}
	}

	override prepareBaseData(): void {
		this.modifiers = new Modifiers(this);
		this.overrides = {};

		super.prepareBaseData();
		if (this.systemData?.prepareBaseData) {
			this.systemData.prepareBaseData();
		}
	}

	override prepareData(): void {
		super.prepareData();
		if (this.systemData?.prepareData) {
			this.systemData.prepareData();
		}
	}

	override prepareDerivedData(): void {
		super.prepareDerivedData();
		if (this.systemData?.prepareDerivedData) {
			this.systemData.prepareDerivedData();
		}
	}

	override getRollData(): Record<string, unknown> {
		return {
			...super.getRollData(),
			...this.systemData.getRollData(),
		};
	}

	/**
	 * Override the _preCreate callback to call preCreate from the data model class, if present.
	 * @inheritDoc
	 */
	protected override async _preCreate(
		data: PreDocumentId<this['_source']>,
		options: DocumentModificationContext<this>,
		user: foundry.documents.BaseUser,
	): Promise<void> {
		await (<IHasPreCreate<this>>this.systemData).preCreate?.(this, data, options, user);
		return super._preCreate(data, options, user);
	}

	protected override _onDelete(options: DocumentModificationContext<this>, userId: string): void {
		(<IHasOnDelete<this>>this.systemData).onDelete?.(this, options, userId);

		super._onDelete(options, userId);
	}

	async _onPostCreate(): Promise<void> {
		await (<IHasPostCreate>this.systemData).onPostCreate?.();
	}

	override async _onUpdate(
		changed: DeepPartial<this['_source']>,
		options: DocumentUpdateContext<this>,
		userId: string,
	): Promise<void> {
		await (<IHasOnUpdate<this>>this.systemData).onUpdate?.(changed, options, userId);
		super._onUpdate(changed, options, userId);

		if (changed.flags?.sr6?.modifiers) {
			this.modifiers.updateSource(this.systemFlags!.modifiers!);
		}
	}

	/**
	 * Override the createDialog callback to include an unique class that identifies the created dialog.
	 * @inheritDoc
	 */
	static override createDialog(
		data?: { folder?: string | undefined } | undefined,
		options?: Partial<FormApplicationOptions> | undefined,
	): Promise<ClientDocument<foundry.documents.BaseItem> | undefined> {
		// The 'dialog' class needs to be added explicitly, otherwise it won't be added by the super call.
		const touchedOptions = {
			...options,
			classes: [...(options?.classes ?? []), 'dialog', 'dialog-item-create'],
		};

		return super.createDialog(data, touchedOptions);
	}
}
