import BaseDataModel from '@/data/BaseDataModel';

export abstract class AdjustableMatrixAttributesDataModel extends BaseDataModel {
	abstract base: MatrixAttributesDataModel;
	abstract current: MatrixAttributesDataModel;

	get a(): number {
		return this.current.attack;
	}

	get s(): number {
		return this.current.sleaze;
	}

	get d(): number {
		return this.current.dataProcessing;
	}

	get f(): number {
		return this.current.firewall;
	}

	reset(): void {
		this.current.attack = this.base.attack;
		this.current.sleaze = this.base.sleaze;
		this.current.dataProcessing = this.base.dataProcessing;
		this.current.firewall = this.base.firewall;
	}

	override getRollData(): Record<string, unknown> {
		return {
			...super.getRollData(),
			attack: this.a,
			sleaze: this.s,
			dataProcessing: this.d,
			firewall: this.f,

			a: this.a,
			s: this.s,
			d: this.d,
			f: this.f,
		};
	}

	override prepareBaseData(): void {
		this.base.prepareBaseData();
		this.current.prepareBaseData();
	}

	override prepareData(): void {
		this.base.prepareBaseData();
		this.current.prepareBaseData();
	}

	override prepareDerivedData(): void {
		this.base.prepareDerivedData();
		this.current.prepareDerivedData();

		if (this.current.attack === 0 && this.base.attack > 0) {
			this.current.attack = this.base.attack;
		}
		if (this.current.sleaze === 0 && this.base.sleaze > 0) {
			this.current.sleaze = this.base.sleaze;
		}
		if (this.current.dataProcessing === 0 && this.base.dataProcessing > 0) {
			this.current.dataProcessing = this.base.dataProcessing;
		}
		if (this.current.firewall === 0 && this.base.firewall > 0) {
			this.current.firewall = this.base.firewall;
		}
	}

	static defineSchema(): foundry.data.fields.DataSchema {
		const fields = foundry.data.fields;

		return {
			base: new fields.EmbeddedDataField(MatrixAttributesDataModel, { required: true, nullable: false }),
			current: new fields.EmbeddedDataField(MatrixAttributesDataModel, {
				required: true,
				nullable: false,
			}),
		};
	}
}

export type MatrixAttributesData = {
	attack: number;
	sleaze: number;
	dataProcessing: number;
	firewall: number;
	formulas: MatrixAttributesFormulaData | null;
};

export type MatrixAttributesFormulaData = {
	attack: string | null;
	sleaze: string | null;
	dataProcessing: string | null;
	firewall: string | null;
};

export abstract class MatrixAttributesDataModel extends BaseDataModel {
	abstract attack: number;
	abstract sleaze: number;
	abstract dataProcessing: number;
	abstract firewall: number;

	abstract formulas: MatrixAttributesFormulaData | null;

	get a(): number {
		return this.attack;
	}

	get s(): number {
		return this.sleaze;
	}

	get d(): number {
		return this.dataProcessing;
	}

	get f(): number {
		return this.firewall;
	}

	override prepareDerivedData(): void {
		if (this.formulas) {
			if (this.formulas.attack) {
				this.attack = this.solveFormula(this.formulas!.attack!);
			}
			if (this.formulas.sleaze) {
				this.sleaze = this.solveFormula(this.formulas!.sleaze!);
			}
			if (this.formulas.dataProcessing) {
				this.dataProcessing = this.solveFormula(this.formulas!.dataProcessing!);
			}
			if (this.formulas.firewall) {
				this.firewall = this.solveFormula(this.formulas!.firewall!);
			}
		}
	}

	static defineSchema(): foundry.data.fields.DataSchema {
		const fields = foundry.data.fields;

		return {
			attack: new fields.NumberField({ initial: 0, min: 0, required: true, nullable: false }),
			sleaze: new fields.NumberField({ initial: 0, min: 0, required: true, nullable: false }),
			dataProcessing: new fields.NumberField({ initial: 0, min: 0, required: true, nullable: false }),
			firewall: new fields.NumberField({ initial: 0, min: 0, required: true, nullable: false }),
			formulas: new fields.SchemaField(
				{
					attack: new fields.StringField({ initial: null, blank: false, required: true, nullable: true }),
					sleaze: new fields.StringField({ initial: null, blank: false, required: true, nullable: true }),
					dataProcessing: new fields.StringField({
						initial: null,
						blank: false,
						required: true,
						nullable: true,
					}),
					firewall: new fields.StringField({ initial: null, blank: false, required: true, nullable: true }),
				},
				{ initial: null, required: true, nullable: true },
			),
		};
	}
}
