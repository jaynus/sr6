import BaseActorDataModel from '@/actor/data/BaseActorDataModel';
import SR6Actor from '@/actor/SR6Actor';
import BaseDataModel from '@/data/BaseDataModel';
import { ConditionalDataModel } from '@/effect/conditional';
import BaseItemDataModel from '@/item/data/BaseItemDataModel';
import { InitiativeRollData } from '@/roll/InitiativeRoll';
import { ITest, TestType } from '@/test';
import { AsyncFunction } from '@/util';

export abstract class EdgeActionScriptsDataModel extends BaseDataModel {
	abstract prepareInitiative: Maybe<string>;
	abstract prepareTest: Maybe<string>;
	abstract finishTest: Maybe<string>;
	abstract finishRoll: Maybe<string>;
	abstract prepareActor: Maybe<string>;

	static defineSchema(): foundry.data.fields.DataSchema {
		const fields = foundry.data.fields;
		return {
			prepareInitiative: new fields.StringField({
				initial: null,
				nullable: true,
				required: false,
				blank: false,
			}),
			prepareTest: new fields.StringField({
				initial: null,
				nullable: true,
				required: false,
				blank: false,
			}),
			finishTest: new fields.StringField({
				initial: null,
				nullable: true,
				required: false,
				blank: false,
			}),
			finishRoll: new fields.StringField({
				initial: null,
				nullable: true,
				required: false,
				blank: false,
			}),
			prepareActor: new fields.StringField({
				initial: null,
				nullable: true,
				required: false,
				blank: false,
			}),
		};
	}
}

interface PrepareInitiativeFn {
	(data: InitiativeRollData): Promise<void>;
}

interface PrepareTestFn {
	(test: ITest): Promise<void>;
}

interface FinishTestFn {
	(test: ITest): Promise<void>;
}

interface FinishRollFn {
	(roll: Roll): Promise<void>;
}

interface PrepareActorFn {
	(actor: SR6Actor<BaseActorDataModel>): Promise<void>;
}

export default abstract class EdgeActionDataModel extends BaseItemDataModel {
	abstract edgeCostFormula: string;
	abstract testClasses: string[];
	abstract conditions: ConditionalDataModel[];

	abstract scripts: EdgeActionScriptsDataModel;

	get cost(): number {
		return this.solveFormula(this.edgeCostFormula);
	}

	abstract prepareInitiative: Maybe<PrepareInitiativeFn>;
	abstract prepareTest: Maybe<PrepareTestFn>;
	abstract finishTest: Maybe<FinishTestFn>;
	abstract finishRoll: Maybe<FinishRollFn>;
	abstract prepareActor: Maybe<PrepareActorFn>;

	override prepareData(): void {
		if (this.scripts?.prepareInitiative) {
			this.prepareInitiative = new AsyncFunction('data', this.scripts!.prepareInitiative);
		}
		if (this.scripts?.prepareTest) {
			this.prepareTest = new AsyncFunction('test', this.scripts!.prepareTest);
		}
		if (this.scripts?.finishTest) {
			this.finishTest = new AsyncFunction('test', this.scripts!.finishTest);
		}
		if (this.scripts?.finishRoll) {
			this.finishRoll = new AsyncFunction('roll', this.scripts!.finishRoll);
		}
		if (this.scripts?.prepareActor) {
			this.prepareActor = new AsyncFunction('actor', this.scripts!.prepareActor);
		}
	}

	static override defineSchema(): foundry.data.fields.DataSchema {
		const fields = foundry.data.fields;
		return {
			...super.defineSchema(),
			edgeCostFormula: new fields.StringField({ initial: '0', nullable: false, required: true, blank: false }),
			testClasses: new fields.ArrayField(
				new fields.StringField({
					required: true,
					nullable: false,
					blank: false,
					choices: Object.values(TestType),
				}),
			),
			conditions: new fields.ArrayField(new fields.EmbeddedDataField(ConditionalDataModel), { initial: [] }),

			scripts: new fields.EmbeddedDataField(EdgeActionScriptsDataModel, { required: true, nullable: false }),
		};
	}
}
