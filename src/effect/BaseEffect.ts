import { ClassData, getClass } from '@/data/serialize';
import SR6ActiveEffect from '@/effect/SR6ActiveEffect';
import { ConstructorOf } from '@/util';
import { Ok, Result } from 'ts-results';

export type BaseEffectSourceData = ClassData & Record<string, unknown>;

export abstract class BaseEffect<TData extends BaseEffectSourceData = BaseEffectSourceData> {
	parent: SR6ActiveEffect;
	data: TData;

	protected constructor({ parent, data }: { parent: SR6ActiveEffect; data: TData }) {
		this.parent = parent;
		this.data = data;
	}

	toObject(): TData {
		return {
			class: this.data.class,
		} as TData;
	}

	static fromData(parent: SR6ActiveEffect, data: BaseEffectSourceData): Result<BaseEffect, string> {
		const cls = getClass<ConstructorOf<BaseEffect>>(CONFIG.sr6.types.effects, data);
		if (cls.ok) {
			return Ok(new cls.val({ parent, data }) as unknown as BaseEffect);
		}
		throw '';
	}
}
