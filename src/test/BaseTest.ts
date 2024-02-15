import { EnumAttribute } from '@/actor/data';
import BaseActorDataModel from '@/actor/data/BaseActorDataModel';
import SR6Actor from '@/actor/SR6Actor';
import { makeDeltaProxy } from '@/data/DeltaProxy';
import { getClass } from '@/data/serialize';
import { EdgeBoostJSON, getEdgeBoost, IEdgeBoost } from '@/edge';
import BaseModifier from '@/modifier/BaseModifier';
import TestRollPrompt from '@/roll/TestRollPrompt';
import { SR6ChatMessage } from '@/chat/SR6ChatMessage';
import SR6Item from '@/item/SR6Item';
import { ModifierSourceData } from '@/modifier';
import { AttackTestData, getAttackDataTargets } from '@/test/AttackTestData';
import { ITest, ITestModifierData, RollDataDelta, TestError, TestType } from '@/test/index';
import SR6Roll from '@/roll/SR6Roll';
import { ConstructorOf, getActorSync, getItemSync } from '@/util';
import { Result, Ok, Err } from 'ts-results';
import { Target } from '@/data';
import { toRaw } from 'vue';

export interface TestEdgeData {
	spent?: EdgeBoostJSON;

	gain?: {
		[Target.Any]: number;
		[Target.Self]: number;
		[Target.Target]: number;
	};
	blockGain?: {
		[Target.Any]: boolean;
		[Target.Self]: boolean;
		[Target.Target]: boolean;
	};
	blockSpend?: {
		[Target.Any]: boolean;
		[Target.Self]: boolean;
		[Target.Target]: boolean;
	};
}

export interface BaseTestData {
	pool?: number;
	actorId?: ActorUUID;
	itemId?: ItemUUID;

	threshold?: number;

	defenseRating?: number;

	autoHits?: number;
	explode?: true;
	parameters?: { glitch: number[]; success: number[] };

	edge?: TestEdgeData;
}

export interface TestConstructorData<
	TData extends BaseTestData,
	TActorDataModel extends BaseActorDataModel = BaseActorDataModel,
> {
	actor: SR6Actor<TActorDataModel>;
	data: TData;
	modifiers?: ITestModifierData[];
	item?: SR6Item;
	delta?: RollDataDelta;
	roll?: SR6Roll;
}

export interface TestModifierStorageData {
	disabled: boolean;
	source: Target;
	modifier: ModifierSourceData;
}

export interface TestSourceData<TData extends BaseTestData> {
	type: string;
	modifiers: TestModifierStorageData[];
	baseData: TData;
	actor: SR6Actor;

	delta?: RollDataDelta;
	item?: SR6Item;
	roll?: RollJSON;
}

export default abstract class BaseTest<TData extends BaseTestData = BaseTestData> implements ITest<TData> {
	protected baseData: TData;
	protected delta: RollDataDelta;
	protected _modifiers: ITestModifierData[];
	actor: SR6Actor;

	item?: SR6Item;
	roll?: SR6Roll;

	edgeBoost?: IEdgeBoost;

	get type(): TestType {
		return TestType.INVALID;
	}

	get isOwner(): boolean {
		return this.actor.isOwner;
	}

	get damage(): number {
		return 0;
	}

	get allModifiers(): ITestModifierData[] {
		return this._modifiers;
	}

	get activeModifiers(): ITestModifierData[] {
		return this._modifiers.filter((data) => !data.disabled);
	}

	get targets(): SR6Actor[] {
		if (Object.prototype.hasOwnProperty.call(this.data, 'targetIds')) {
			return getAttackDataTargets(this.data as unknown as AttackTestData);
		}
		return [];
	}

	get targetsDefenseRating(): number | undefined {
		if (!this.targets) {
			return undefined;
		}

		return this.targets.reduce((acc, target) => {
			const defenseRating = toRaw(target).systemData.defenseRating(this);
			if (defenseRating > acc) {
				acc = defenseRating;
			}
			return acc;
		}, 0);
	}

	get pool(): number {
		return this.data.pool || 0;
	}

	set pool(newValue: number) {
		this.data.pool = Math.max(0, newValue);
	}

	is(_type: ConstructorOf<BaseTest>): boolean {
		throw 'lol';
	}

	// We use a proxy here for any changes to be applied to the delta
	get data(): TData {
		return makeDeltaProxy(this.baseData, this.delta, this.onDataChanged.bind(this));
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
	protected onDataChanged(_key: string, value: any): any {
		// this.resetActiveModifiers();
		return value;
	}

	resetActiveModifiers(): void {
		this._modifiers.forEach((entry) => {
			entry.disabled = !entry.modifier.isModifying(this);
		});
	}

	async performRoll(): Promise<Result<null, string>> {
		if (this.roll && !this.roll._evaluated) {
			this.roll = await this.roll?.evaluate({ async: true });
			if (this.roll.options.explode) {
				await this.roll.explode();
			}

			return Ok(null);
		}

		return Err('Roll was undefined');
	}

	createRoll(): SR6Roll {
		return SR6Roll.createRoll(
			this.data.pool!,
			{
				actor: this.actor.getRollData(),
				item: this.item?.getRollData(),
			},
			{
				threshold: this.data.threshold,
				parameters: this.data.parameters,
			},
		);
	}

	get availableEdge(): number {
		let gain = 0;
		// Dont show edge gains post roll
		if (this.data.edge?.gain && !this.roll) {
			gain = this.data.edge!.gain[Target.Self];
		}
		if (this.actor.systemData.monitors) {
			return this.actor.systemData.monitors.edge.value + gain;
		} else {
			return 0;
		}
	}

	async applyEdgeBoost(boost: IEdgeBoost): Promise<boolean> {
		if (this.data.edge?.spent) {
			return false;
		}
		this.data.edge!.spent = boost.toJSON();
		this.edgeBoost = boost;

		// Are we applying post-roll? If so call the post roll application
		if (this.roll) {
			await this.edgeBoost.finishRoll?.(this.roll);
			await this.edgeBoost.finishTest?.(this);
			await this.edgeBoost.finishActor?.(this.actor);
		}

		await this.actor.systemData.monitors.spendEdge(this.edgeBoost.cost);

		return true;
	}

	async execute(): Promise<Result<null, TestError>> {
		// Add our modifiers to the roll delta
		await this.prepareModifiers();

		const configuredData = await this.prompt();
		if (configuredData.ok) {
			if (this.edgeBoost) {
				await this.edgeBoost.prepareTest?.(this);
				await this.edgeBoost.prepareActor?.(this.actor);
			}
			this.roll = this.createRoll();

			const res = await this.performRoll();
			if (res.ok) {
				// Finalize things
				await this._onUse();
				await this.finishModifiers();

				if (this.roll.success) {
					await this._onSuccess();
				} else {
					await this._onFailure();
				}

				await this.toMessage();

				return Ok(null);
			} else {
				return Err(TestError.RollFailed);
			}
		}

		return Err(TestError.Cancelled);
	}

	async prompt(): Promise<Result<RollDataDelta, null>> {
		const configuredRoll = await TestRollPrompt.prompt<TData, this>(this);
		if (!configuredRoll) {
			return Err(null);
		}

		return Ok(this.delta);
	}

	async reset(): Promise<void> {
		this.delta = {};
		await this.prepareModifiers();
	}

	async prepareModifiers(): Promise<void> {
		for (const entry of this.activeModifiers) {
			if (entry.source === Target.Self) {
				await entry.modifier.prepareTest?.(this);
			}
			if (entry.source === Target.Target) {
				await entry.modifier.prepareOpposedTest?.(this);
			}
		}
	}

	async finishModifiers(): Promise<void> {
		for (const entry of this.activeModifiers) {
			if (entry.source === Target.Self) {
				await entry.modifier.finishTest?.(this);
			}
			if (entry.source === Target.Target) {
				await entry.modifier.finishOpposedTest?.(this);
			}
		}

		// Did we have edge gain? apply
		if (this.data.edge?.gain) {
			if (this.data.edge!.gain![Target.Self]) {
				await this.actor.systemData.monitors.gainEdge(this.data.edge!.gain![Target.Self]);
			}
			if (this.data.edge!.gain![Target.Target]) {
				// We dont know if we are an attack type here, so lets just check cuz lazy
				for (const target of this.targets) {
					await target.systemData.monitors.gainEdge(this.data.edge!.gain![Target.Target]);
				}
			}
		}

		if (this.edgeBoost) {
			if (this.roll) {
				await this.edgeBoost.finishRoll?.(this.roll);
			}

			await this.edgeBoost.finishTest?.(this);
			await this.edgeBoost.finishActor?.(this.actor);

			// Did we have edge spends? if so, apply them to the actor
			await this.actor.systemData.monitors.spendEdge(this.edgeBoost.cost);
		}
	}

	async toMessage(): Promise<SR6ChatMessage | undefined> {
		let speaker = undefined;
		if (this.actor.isToken) {
			speaker = ChatMessage._getSpeakerFromToken({ token: this.actor.getActiveTokens()[0] });
		} else {
			speaker = ChatMessage._getSpeakerFromActor({ actor: this.actor });
		}

		return await SR6ChatMessage.create({
			user: game.user?.id,
			type: CONST.CHAT_MESSAGE_TYPES.ROLL,
			speaker,
			roll: this.roll?.toJSON(),
			content: '',
			flags: {
				['sr6']: { testData: this.toJSON() },
				'core.canPopout': true,
			},
			sound: CONFIG.sounds.dice,
		});
	}

	toJSON(): Record<string, unknown> {
		return {
			type: this.type,
			baseData: this.baseData,
			delta: this.delta,
			modifiers: this._modifiers.map(({ disabled, modifier }) => {
				return {
					disabled,
					modifier: modifier.toJSON(),
				};
			}),
			roll: this.roll?.toJSON(),
		};
	}

	async prepared(): Promise<BaseTest> {
		await this.prepareModifiers();
		return this;
	}

	protected constructor(args: TestConstructorData<TData>) {
		this.delta = args.delta || {};
		this.baseData = args.data;
		this.actor = args.actor;
		this.item = args.item;
		this.roll = args.roll;
		this._modifiers = [];

		this.baseData.actorId = args.actor.uuid;
		this.baseData.itemId = args.item ? args.item.uuid : undefined;

		this.baseData.edge = this.baseData.edge || {
			gain: {
				[Target.Any]: 0,
				[Target.Self]: 0,
				[Target.Target]: 0,
			},
		};

		if (this.data.edge?.spent) {
			this.edgeBoost = getEdgeBoost(this.data.edge!.spent);
		}

		this.baseData.defenseRating = this.targetsDefenseRating;

		this.loadModifiers(args);
	}

	loadModifiers(args?: TestConstructorData<TData>): void {
		this._modifiers = [];

		if (args?.modifiers) {
			this._modifiers = args!.modifiers;
			return;
		}

		this._modifiers = this.actor.modifiers.getApplicable(this).map((modifier) => {
			return {
				disabled: !modifier.isModifying(this),
				source: Target.Self,
				modifier,
			};
		});

		// Also add item modifiers
		if (this.item) {
			this._modifiers = this._modifiers.concat(
				this.item.modifiers.getApplicable(this).map((modifier) => {
					return {
						disabled: false,
						source: Target.Self,
						modifier,
					};
				}),
			);
		}

		// Do we have targets? If so, copy any opposed modifiers of theirs that apply to this test
		if (this.targets) {
			this.targets.forEach((target) => {
				this._modifiers = this._modifiers.concat(
					target.modifiers
						.getApplicable(this)
						.filter((modifier) => modifier.hasOpposed)
						.map((modifier) => {
							return {
								disabled: false,
								source: Target.Target,
								modifier,
							};
						}),
				);
			});
		}
	}

	static fromData<TTest extends BaseTest = BaseTest, TData extends BaseTestData = BaseTestData>(
		msgData: TestSourceData<TData>,
	): Result<TTest, TestError> {
		const actor = getActorSync(SR6Actor, msgData.baseData.actorId!);
		const item = msgData.baseData.itemId ? getItemSync(SR6Item, msgData.baseData.itemId) : null;
		const modifiers = msgData.modifiers.map((modifierData) => {
			return {
				disabled: modifierData.disabled,
				source: modifierData.source,
				modifier: BaseModifier.fromData(modifierData.modifier),
			};
		});

		if (!actor || (!item && msgData.baseData.itemId)) {
			console.warn('Test actor has been deleted.');
			return Err(TestError.MissingDocument);
		}

		const cls = getClass<ConstructorOf<BaseTest>>(CONFIG.sr6.types.tests, { class: msgData.type });
		if (cls.ok) {
			const test = new cls.val({
				actor,
				item,
				data: msgData.baseData,
				delta: msgData.delta,
				roll: msgData.roll ? SR6Roll.fromData(msgData.roll) : undefined,
				modifiers,
			}) as TTest;
			return Ok(test);
		}
		return Err(TestError.FailedConstructor);
	}

	// Provide interfaces for doing things at times
	protected async _onSuccess(): Promise<void> {}

	protected async _onFailure(): Promise<void> {}

	protected async _onUse(): Promise<void> {}

	// Edge control
	canGainEdge(target: Target): boolean {
		return !(this.data.edge?.blockGain?.[target] || this.data.edge?.blockGain?.[Target.Any]);
	}

	canSpendEdge(target: Target): boolean {
		return !(this.data.edge?.blockSpend?.[target] || this.data.edge?.blockSpend?.[Target.Any]);
	}

	getEdgeGain(target: Target): number {
		return this.data.edge?.gain?.[target] || 0;
	}

	setEdgeGain(target: Target, value: number): boolean {
		if (this.data.edge?.blockGain?.[target] || this.data.edge?.blockGain?.[Target.Any]) {
			return false;
		}

		this.data.edge!.gain![target] = value;

		return true;
	}

	hasAttribute(_attribute: EnumAttribute): boolean {
		return false;
	}

	hasSkill(_skill: string): boolean {
		return false;
	}
}
