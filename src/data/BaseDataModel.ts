import SR6Actor from '@/actor/SR6Actor';
import SR6Item from '@/item/SR6Item';

export default abstract class BaseDataModel extends foundry.abstract.DataModel {
	abstract parent: SR6Item | SR6Actor | BaseDataModel;

	static _enableV10Validation = true;

	/*
	get path(): string {
		if (this.parent instanceof BaseDataModel) {
			return `${this.parent.path}.`;
		} else if (this.parent instanceof SR6Actor || this.parent instanceof SR6Item) {
			return 'system';
		}
		throw 'err';
	}
	*/

	get isOwner(): boolean {
		if (this.actor) {
			return this.actor!.isOwner;
		} else if (this.item) {
			return this.item!.isOwner;
		}

		return game.user!.isGM;
	}

	get actor(): SR6Actor | null {
		const parent = this.parent;

		if (parent instanceof SR6Actor) {
			return parent;
		} else {
			if (parent instanceof BaseDataModel) {
				return (parent as BaseDataModel).actor;
			} else if (parent instanceof SR6Item) {
				return (parent as SR6Item).actor;
			}
			return null;
		}
	}

	get item(): SR6Item | null {
		const parent = this.parent;

		if (parent instanceof SR6Item) {
			return parent;
		} else {
			if (parent instanceof BaseDataModel) {
				return (parent as BaseDataModel).item;
			}
			return null;
		}
	}

	solveFormula(formula: string, data: Record<string, unknown> = {}): number {
		const item = this.item;
		const actor = this.actor;

		if (item) {
			return item.solveFormula(formula, actor, data);
		} else {
			if (actor) {
				return actor.solveFormula(formula, data);
			}
		}

		const err = `No parent that can solve a formula exists for this model ${typeof this}`;
		console.error(err, formula, this);
		throw err;
	}

	prepareEmbeddedDocuments(): void {}

	prepareBaseData(): void {}

	prepareData(): void {}

	prepareDerivedData(): void {}

	applyActiveEffects(): void {}
	getRollData(): Record<string, unknown> {
		return {};
	}

	constructor(
		data?: DeepPartial<SourceFromSchema<foundry.data.fields.DataSchema>>,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		options?: DataModelConstructionOptions<any>,
	) {
		super(data, options);
	}
}
