import SR6Actor from '@/actor/SR6Actor';
import BaseDataModel from '@/data/BaseDataModel';
import { AvailableActions } from '@/data/interfaces';
import SR6Item from '@/item/SR6Item';

export default class InitiativeDataModel extends BaseDataModel {
	declare parent: SR6Item | SR6Actor | BaseDataModel;

	declare dice: number;
	declare scoreFormula: string;

	declare actions: {
		majorFormula: string;
		minorFormula: string;
	};

	get score(): number {
		return this.solveFormula(this.scoreFormula);
	}

	get availableActions(): AvailableActions {
		return {
			major: this.solveFormula(this.actions.majorFormula),
			minor: this.solveFormula(this.actions.minorFormula),
		};
	}

	static defineSchema(): foundry.data.fields.DataSchema {
		const fields = foundry.data.fields;

		return {
			dice: new fields.NumberField({ initial: 0, required: true, nullable: false, integer: true, min: 0 }),
			scoreFormula: new fields.StringField({
				initial: '(@reaction + @intuition)',
				required: true,
				nullable: false,
				blank: false,
			}),
			actions: new fields.SchemaField(
				{
					majorFormula: new fields.StringField({
						initial: '1',
						required: true,
						nullable: false,
						blank: false,
					}),
					minorFormula: new fields.StringField({
						initial: '1 + @initiatives.physical.dice',
						required: true,
						nullable: false,
						blank: false,
					}),
				},
				{ required: true, nullable: false },
			),
		};
	}
}
