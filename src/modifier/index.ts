import { InitiativeType } from '@/data';
import { AvailableActions } from '@/data/interfaces';
import { ConditionalData } from '@/effect/conditional';
import SR6ActiveEffect from '@/effect/SR6ActiveEffect';
import { MatrixPersonaModifier } from '@/modifier/impl/MatrixPersonaModifier';
import { ModifierDataModel } from '@/modifier/ModifierDataModel';
import { InitiativeRollData } from '@/roll/InitiativeRoll';

import { ITest } from 'src/test';
import { ClassData } from '@/data/serialize';

import BaseModifier from '@/modifier/BaseModifier';
import {
	PoolModifier,
	TestFunctionModifier,
	AttackRatingModifier,
	DefenseRatingModifier,
	DamageModifier,
} from '@/modifier/TestModifiers';
import { BlockActionModifier } from '@/modifier/impl/BlockActionModifier';
import { CoverModifier } from '@/modifier/status/CoverModifier';
import { BlindedModifier } from '@/modifier/status/BlindedModifier';

// Specialized impls
import { WoundModifier } from '@/modifier/impl/WoundModifier';
import { PainEditorModifier } from '@/modifier/impl/PainEditorModifier';
import { EdgeModifier } from '@/modifier/impl/EdgeModifier';
import { InitiativeModifier } from '@/modifier/impl/InitiativeModifier';

export type ModifierSourceUUID =
	| ActorDocumentUUID
	| TokenDocumentUUID
	| ActiveEffectUUID
	| EmbeddedItemUUID
	| WorldDocumentUUID<Scene>;

export interface IModifier {
	get class(): string;

	get target(): ModifierTarget;

	get data(): Record<string, unknown>;

	isApplicable(test: Maybe<ITest>, roll: Maybe<Roll>): boolean;

	// Is it currently changing the test?
	isModifying(test: ITest): boolean;

	get name(): undefined | string;
	get description(): undefined | string;
	get displayValue(): undefined | string;

	get parent(): foundry.abstract.Document;
	get source(): foundry.abstract.Document;

	get hasOpposed(): boolean;

	prepareOpposedTest?<TTest extends ITest>(test: TTest): Promise<void>;
	finishOpposedTest?<TTest extends ITest>(test: TTest): Promise<void>;

	prepareTest?<TTest extends ITest>(test: TTest): Promise<void>;
	finishTest?<TTest extends ITest>(test: TTest): Promise<void>;

	prepareInitiative?(
		type: InitiativeType,
		initiative: Maybe<InitiativeRollData>,
		actions: Maybe<AvailableActions>,
	): void;

	toJSON(): ModifierSourceData;
}

export enum ModifierTarget {
	Actor = 'actor',
	Item = 'item',
}

export type ModifierSourceData = {
	parent?: ModifierSourceUUID;
	source?: ModifierSourceUUID;

	name?: string;
	description?: string;
	conditions?: ConditionalData[];
	target?: ModifierTarget;
} & ClassData &
	Record<string, unknown>;

export interface ModifiersSourceData {
	modifiers?: ModifierSourceData[];
}

export type ModifierConstructorData<TSourceData extends ModifierSourceData> = {
	parent: foundry.abstract.Document;
	source: foundry.abstract.Document;
	conditions?: ConditionalData[];
	target: ModifierTarget;
	data: TSourceData;
};

export interface SimpleModifiersData {
	persona?: {
		attack?: number;
		sleaze?: number;
		dataProcessing?: number;
		firewall?: number;
	};
}

export class Modifiers<TDocument extends foundry.abstract.Document = foundry.abstract.Document> {
	parent: TDocument;
	sourceData: ModifiersSourceData;
	all: IModifier[];
	simple: SimpleModifiersData = {};

	getApplicable(test: Maybe<ITest> = null): IModifier[] {
		return this.all.filter((mod) => mod.isApplicable(test, null));
	}

	updateSource(data: ModifiersSourceData): void {
		this.all = [];
		this.sourceData = data;

		if (this.sourceData.modifiers) {
			this.sourceData.modifiers!.forEach((modifierSourceData) => {
				const mod = BaseModifier.fromData(modifierSourceData, this.parent);
				if (mod.ok) {
					this.all.push(mod.val);
				} else {
					console.error(mod.val);
				}
			});
		}
	}

	async pushSave(newModifier: IModifier): Promise<void> {
		this.all.push(newModifier);
		await this.save();
	}

	async save(): Promise<void> {
		// Copy the active modifiers to their source data and then write it
		this.sourceData.modifiers = this.all.map((mod) => mod.toJSON());
		await this.parent.update({ ['flags.sr6.modifiers']: this.sourceData }, { diff: false });
	}

	constructor(parent: TDocument) {
		const sourceData = parent.getFlag('sr6', 'modifiers') as ModifiersSourceData | undefined;
		this.parent = parent;
		this.sourceData = sourceData ? sourceData : {};
		this.all = [];
		this.updateSource(this.sourceData);
	}
}

export function register(): void {}

export function config(): Record<string, unknown> {
	return {
		PoolModifier: PoolModifier,
		AttackRatingModifier: AttackRatingModifier,
		DefenseRatingModifier: DefenseRatingModifier,
		DamageModifier: DamageModifier,

		TestFunctionModifier: TestFunctionModifier,

		PainEditorModifier: PainEditorModifier,
		WoundModifier: WoundModifier,

		EdgeModifier: EdgeModifier,

		InitiativeModifier: InitiativeModifier,
		CoverModifier: CoverModifier,
		BlindedModifier: BlindedModifier,

		BlockActionModifier: BlockActionModifier,

		MatrixPersonaModifier: MatrixPersonaModifier,
	};
}

export async function createModifiers<TParent extends foundry.abstract.Document>(
	parent: TParent,
	effect: SR6ActiveEffect,
	modifiers: ModifierDataModel[],
): Promise<void> {
	if (effect) {
		modifiers.forEach((modifierDataModel) => {
			const modifier = modifierDataModel.create(effect, parent);
			if (modifier.ok) {
				effect.modifiers.all.push(modifier.val);
			}
		});
		await effect.modifiers.save();
	}
}
