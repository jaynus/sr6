import { getClass } from '@/data/serialize';
import { checkConditions, ConditionalData } from '@/effect/conditional';
import { IModifier, ModifierSourceData, ModifierSourceUUID, ModifierTarget } from '@/modifier';
import { ITest } from '@/test';
import { ConstructorOf } from '@/util';
import { Err, Ok, Result } from 'ts-results';

export default class BaseModifier<
	TData extends ModifierSourceData = ModifierSourceData,
	TParent extends foundry.abstract.Document = foundry.abstract.Document,
	TSource extends foundry.abstract.Document = foundry.abstract.Document,
> implements IModifier
{
	_parent: TParent;
	_source: TSource;
	_target: ModifierTarget;
	conditions: ConditionalData[];
	data: TData;

	isModifying(_test: ITest): boolean {
		return true;
	}

	get target(): ModifierTarget {
		return this._target;
	}

	get class(): string {
		return this.constructor.name;
	}

	get name(): undefined | string {
		return this.data!.name ? game.i18n.localize(this.data.name) : '[Missing name]';
	}

	get description(): undefined | string {
		return this.data!.description ? game.i18n.localize(this.data.description) : '[Missing Description]';
	}

	get displayValue(): undefined | string {
		return '-';
	}

	get parent(): foundry.abstract.Document {
		return this._parent;
	}

	get source(): foundry.abstract.Document {
		return this._source;
	}

	get hasOpposed(): boolean {
		return (<IModifier>this).prepareOpposedTest !== undefined || (<IModifier>this).finishOpposedTest !== undefined;
	}

	isApplicable(_test: Maybe<ITest> = null, _roll: Maybe<Roll> = null): boolean {
		if (this.conditions.length === 0) {
			return true;
		}

		return checkConditions(this.source, this.parent, this.conditions).ok;
	}

	static fromData<TDocument extends foundry.abstract.Document>(
		data: ModifierSourceData,
		creatingParent: Maybe<TDocument> = undefined,
	): Result<IModifier, string> {
		let parent = fromUuidSync(data.parent!) as Maybe<TDocument>;
		let source = fromUuidSync(data.source!) as Maybe<TDocument>;

		if ((!parent || !source) && !creatingParent) {
			return Err(`Source or parent document didnt exist: ${parent}, ${source}`);
		}
		if (!parent && creatingParent) {
			data.parent = creatingParent.uuid as ModifierSourceUUID;
			parent = creatingParent;
		}
		if (!source && creatingParent) {
			data.source = creatingParent.uuid as ModifierSourceUUID;
			source = creatingParent;
		}

		const cls = getClass<ConstructorOf<BaseModifier>>(CONFIG.sr6.types.modifiers, data);
		if (cls.ok) {
			return Ok(
				new cls.val({
					parent,
					source,
					conditions: data.conditions,
					target: data.target,
					data,
				}) as unknown as IModifier,
			);
		} else {
			return Err(`Invalid modifier class: ${data.class}`);
		}
	}

	toJSON(): ModifierSourceData {
		return {
			name: this.name,
			description: this.description,
			class: this.constructor.name,
			parent: this.parent.uuid as ModifierSourceUUID,
			source: this.source.uuid as ModifierSourceUUID,
			conditions: this.conditions,
			target: this.target,
		};
	}

	constructor({
		parent,
		source,
		conditions,
		target,
		data,
	}: {
		parent: TParent;
		source: TSource;
		target: ModifierTarget;
		conditions?: ConditionalData[];
		data: TData;
	}) {
		this.data = data;
		this._parent = parent;
		this._source = source;
		this._target = target || ModifierTarget.Actor;
		this.conditions = conditions ? conditions : [];

		// Attempt to localize names if they exist, otherwise replace with placeholders
	}
}
