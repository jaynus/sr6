/**
 *
 * @author jaynus
 * @file Base SR6 Actor
 */
import BaseActorDataModel from '@/actor/data/BaseActorDataModel';
import SR6Combat from '@/combat/SR6Combat';
import SR6Combatant from '@/combat/SR6Combatant';
import BaseDataModel from '@/data/BaseDataModel';
import {
	IHasCombat,
	IHasMatrix,
	IHasModifiers,
	IHasOnDelete,
	IHasOnUpdate,
	IHasPostCreate,
	IHasPreCreate,
	IHasSystemData,
} from '@/data/interfaces';
import SR6ActiveEffect from '@/effect/SR6ActiveEffect';
import MatrixActionDataModel from '@/item/data/action/MatrixActionDataModel';
import MatrixPersonaDataModel from '@/item/data/feature/MatrixPersonaDataModel';
import SkillDataModel from '@/item/data/feature/SkillDataModel';
import CredstickDataModel from '@/item/data/gear/CredstickDataModel';
import GearDataModel from '@/item/data/gear/GearDataModel';
import SR6Item from '@/item/SR6Item';
import { Modifiers, ModifiersSourceData, ModifierTarget } from '@/modifier';
import FormulaRoll from '@/roll/FormulaRoll';
import * as util from '@/util';

export interface SR6ActorFlags {
	modifiers?: ModifiersSourceData;
}

export default class SR6Actor<ActorDataModel extends foundry.abstract.DataModel = BaseActorDataModel>
	extends Actor<TokenDocument, Record<string, SR6Item>, SR6ActiveEffect>
	implements IHasSystemData, IHasModifiers, IHasMatrix, IHasCombat
{
	declare flags: {
		sr6?: SR6ActorFlags;
	};

	modifiers: Modifiers<SR6Actor<ActorDataModel>> = new Modifiers(this);

	get matrixPersona(): Maybe<SR6Item<MatrixPersonaDataModel>> {
		return this.items.find((i) => i.type === 'matrix_persona') as Maybe<SR6Item<MatrixPersonaDataModel>>;
	}

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

	/**
	 * Specialized property for accessing `actor.system` in a typed manner.
	 */
	get systemData(): ActorDataModel {
		return <ActorDataModel>this.system;
	}

	get systemFlags(): undefined | SR6ActorFlags {
		return this.flags['sr6'] as SR6ActorFlags;
	}

	getSystemData(): BaseDataModel {
		return this.systemData;
	}

	get inCombat(): boolean {
		if (!game.combat) {
			return false;
		}
		if (game.combat!.combatants.find((c) => c.actor?.uuid === this.uuid)) {
			return true;
		}

		return false;
	}

	protected override async _onUpdate(
		changed: DeepPartial<this['_source']>,
		options: DocumentUpdateContext<this>,
		userId: string,
	): Promise<void> {
		await (<IHasOnUpdate<this>>this.systemData).onUpdate?.(changed, options, userId);
		super._onUpdate(changed, options, userId);

		if (changed.flags?.sr6?.modifiers) {
			this.modifiers.updateSource(this.systemFlags?.modifiers!);
		}
	}

	skill(skillId_or_name: string): SR6Item<SkillDataModel> | null {
		let skill = this.items.get(skillId_or_name);
		if (!skill) {
			skill = this.items.getName(skillId_or_name);
		}
		if (skill) {
			return skill as SR6Item<SkillDataModel>;
		}

		return null;
	}

	get credsticks(): SR6Item<CredstickDataModel>[] {
		return this.items.filter((item) => item.type === 'credstick') as SR6Item<CredstickDataModel>[];
	}

	item<TDataModel extends BaseDataModel = BaseDataModel>(id: string): SR6Item<TDataModel> | null {
		let item = this.items.get(id);
		if (!item) {
			item = this.items.getName(id);
		}
		if (item) {
			return item as SR6Item<TDataModel>;
		}

		return null;
	}

	matrixAction(action_id_or_name: string): SR6Item<MatrixActionDataModel> | null {
		let skill = this.items.get(action_id_or_name);
		if (!skill) {
			skill = this.items.getName(action_id_or_name);
		}
		if (skill) {
			return skill as SR6Item<MatrixActionDataModel>;
		}

		return null;
	}

	override prepareBaseData(): void {
		super.prepareBaseData();
		this.modifiers = new Modifiers<SR6Actor<ActorDataModel>>(this);
	}

	override prepareEmbeddedDocuments(): void {
		super.prepareEmbeddedDocuments();
		this.systemData.prepareEmbeddedDocuments();
	}

	override prepareData(): void {
		super.prepareData();
		this.systemData.prepareData();
	}

	override prepareDerivedData(): void {
		super.prepareDerivedData();
		this.systemData.prepareDerivedData();
	}

	async cycleActiveEffects(): Promise<void> {
		const toDelete: string[] = [];

		this.effects.forEach((effect) => {
			const e = effect as SR6ActiveEffect;
			console.log(e.isTemporary, e.duration.remaining);
			if (e.isTemporary && e.duration.remaining !== null && e.duration.remaining < 1) {
				toDelete.push(effect.id);
			}
		});

		if (toDelete.length) {
			for (const id of toDelete) {
				await this.effects.get(id)!.delete();
			}
		}

		for (const item of this.items) {
			await (item as SR6Item).cycleActiveEffects();
		}
	}

	override applyActiveEffects(): void {
		super.applyActiveEffects();

		for (const e of this.allApplicableEffects()) {
			const effect = e as SR6ActiveEffect;
			if (e.disabled) {
				continue;
			}
			effect.modifiers.all
				.filter((mod) => mod.target === ModifierTarget.Actor)
				.forEach((mod) => this.modifiers.all.push(mod));
		}

		// Apply and prepare attached items first
		this.items
			.map((item) => item as SR6Item)
			.filter((item) => (item.systemData as GearDataModel).attached)
			.forEach((item) => item.applyActiveEffects());

		// Now all unattached items
		this.items
			.map((item) => item as SR6Item)
			.filter((item) => !(item.systemData as GearDataModel).attached)
			.forEach((item) => item.applyActiveEffects());

		this.systemData.applyActiveEffects();
	}

	solveFormula(formula: string, data: Record<string, unknown> = {}): number {
		let roll = new FormulaRoll(formula, { ...this.getRollData(), ...data, actor: this });
		roll = roll.evaluate({ async: false });

		return roll.total!;
	}

	override getRollData(): Record<string, unknown> {
		const skills: Record<string, unknown> = {};

		this.items
			.filter((i) => i.type === 'skill' || i.type === 'knowledge')
			.forEach((i) => {
				const skill = i as SR6Item<SkillDataModel>;
				skills[skill.safe_name] = skill.systemData.points;
				skill.systemData.specializations.forEach((special) => {
					const safe_special = util.toSnakeCase(special);
					skills[safe_special] = skill.systemData.getPoints(special);
				});
			});

		return foundry.utils.mergeObject(skills, {
			...super.getRollData(),
			...this.systemData.getRollData(),
			actor: this,
		});
	}

	/**
	 * Override the _preCreate callback to call preCreate from the data model class, if present.
	 * @inheritDoc
	 */
	protected override async _preCreate(
		data: PreDocumentId<this['_source']>,
		options: DocumentModificationContext<this>,
		user: User,
	): Promise<void> {
		await (<IHasPreCreate<this>>this.systemData).preCreate?.(this, data, options, user);

		return super._preCreate(data, options, user);
	}

	/**
	 * Override the _onDelete callback to call onDelete from the data model class, if present.
	 * @inheritDoc
	 */
	protected override _onDelete(options: DocumentModificationContext<this>, userId: string): void {
		(<IHasOnDelete<this>>this.systemData).onDelete?.(this, options, userId);

		super._onDelete(options, userId);
	}

	async _onPostCreate(): Promise<void> {
		await (<IHasPostCreate>this.systemData).onPostCreate?.();
	}

	/**
	 * Override the createDialog callback to include a unique class that identifies the created dialog.
	 * @inheritDoc
	 */
	static override createDialog(
		data?: { folder?: string | undefined } | undefined,
		options?: Partial<FormApplicationOptions> | undefined,
	): Promise<ClientDocument<foundry.documents.BaseActor> | undefined> {
		// The 'dialog' class needs to be added explicitly, otherwise it won't be added by the super call.
		const touchedOptions = {
			...options,
			classes: [...(options?.classes ?? []), 'dialog', 'dialog-actor-create'],
		};

		return super.createDialog(data, touchedOptions);
	}

	constructor(data: PreCreate<foundry.data.ActorSource>, context?: DocumentConstructionContext<Actor>) {
		super(data, context);
	}
}
