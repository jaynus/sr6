import BaseDataModel from '@/data/BaseDataModel';
import { IHasEdge } from '@/data/interfaces';
import { IModifier, ModifierTarget } from '@/modifier';
import { WoundModifier } from '@/modifier/impl/WoundModifier';

export enum MonitorType {
	Physical = 'physical',
	Overflow = 'overflow',
	Stun = 'stun',
	Matrix = 'matrix',
	Edge = 'edge',
}

export type WoundModifierData = Partial<Record<MonitorType, number>>;

export abstract class MonitorDataModel extends BaseDataModel {
	abstract damage: number;
	abstract max: number;
	abstract formula: string | null;

	get woundModifier(): number {
		return -Math.floor(this.damage / 3);
	}

	get value(): number {
		return Math.max(0, this.max - this.damage);
	}

	override getRollData(): Record<string, unknown> {
		return {
			damage: this.damage,
			max: this.max,
			value: this.value,
			woundModifier: this.woundModifier,
		};
	}

	// TODO:
	async applyHeal(_type: MonitorType, _value: number): Promise<void> {}

	// TODO:
	async applyDamage(_type: MonitorType, _value: number): Promise<void> {}

	static defineSchema(): foundry.data.fields.DataSchema {
		const fields = foundry.data.fields;

		return {
			damage: new fields.NumberField({ initial: 0, required: true, nullable: false, integer: true, min: 0 }),
			max: new fields.NumberField({ initial: 0, required: true, nullable: false, integer: true, min: 0 }),
			formula: new fields.StringField({ initial: null, required: true, nullable: true, blank: false }),
		};
	}

	override prepareBaseData(): void {
		if (this.formula) {
			this.max = this.solveFormula(this.formula);
		}
	}
}

export default abstract class MonitorsDataModel extends BaseDataModel implements IHasEdge {
	abstract physical: MonitorDataModel;
	abstract stun: MonitorDataModel;
	abstract overflow: MonitorDataModel;
	abstract edge: MonitorDataModel;

	get woundModifiers(): WoundModifierData {
		return {
			[MonitorType.Physical]: this.physical.woundModifier,
			[MonitorType.Stun]: this.stun.woundModifier,
		};
	}

	get woundModifier(): number {
		const modifiers = this.woundModifiers;
		return modifiers[MonitorType.Physical]! + modifiers[MonitorType.Stun]!;
	}

	get(type: MonitorType): MonitorDataModel {
		switch (type) {
			case MonitorType.Physical:
				return this.physical;
			case MonitorType.Overflow:
				return this.overflow;
			case MonitorType.Stun:
				return this.stun;
			case MonitorType.Edge:
				return this.edge;
		}
		throw 'ERROR INVALID MONITOR TYPE';
	}

	async setDamage(type: MonitorType, newDamage: number): Promise<void> {
		if (type === MonitorType.Edge) {
			ui.notifications.error('Dont use applyDamage for edge, use spendEdge instaed');
			return;
		}

		// If the setDamage call was on overflow, that means physical automatically maxes.
		if (type === MonitorType.Overflow) {
			if (newDamage > 0 && this.physical.damage < this.physical.max) {
				await this.actor!.update({ [`system.monitors.physical.damage`]: this.physical.max });
			}
		}

		await this.actor!.update({ [`system.monitors.${type.toString()}.damage`]: newDamage });
	}

	// returns remainder
	private async _applyDamage(type: MonitorType, value: number): Promise<number> {
		const monitor: MonitorDataModel = this.get(type);

		const newDamage: number = monitor.damage + value;
		const remainder: number = Math.max(0, newDamage - monitor.max);

		if (remainder > 0) {
			await this.actor!.update({ [`system.monitors.${type.toString()}.damage`]: monitor.max });
			return remainder;
		} else {
			await this.actor!.update({ [`system.monitors.${type.toString()}.damage`]: newDamage });
			return 0;
		}
	}

	async applyHeal(type: MonitorType, value: number): Promise<void> {
		if (type === MonitorType.Edge) {
			ui.notifications.error('Dont use applyHeal for edge, use spendEdge instaed');
			return;
		}
		const monitor: MonitorDataModel = this.get(type);

		if (type === MonitorType.Physical) {
			let remainder = value;
			if (this.overflow.damage > 0) {
				remainder = this.overflow.damage - value;
				await this.actor!.update({
					[`system.monitors.overflow.damage`]: Math.max(0, this.overflow.damage - value),
				});
				if (remainder < 0) {
					await this.actor!.update({
						[`system.monitors.physical.damage`]: Math.max(0, monitor.damage - Math.abs(remainder)),
					});
					return;
				}
			}
		}

		await this.actor!.update({
			[`system.monitors.${type.toString()}.damage`]: Math.max(0, monitor.damage - value),
		});
	}

	async applyDamage(type: MonitorType, value: number): Promise<void> {
		if (type === MonitorType.Edge) {
			ui.notifications.error('Dont use applyDamage for edge, use spendEdge instaed');
			return;
		}
		let physicalDamage: number = type === MonitorType.Physical ? value : 0;
		let overflowDamage: number = 0;

		if (type === MonitorType.Stun) {
			const remainder: number = await this._applyDamage(type, value);
			if (remainder > 0) {
				physicalDamage = await this._applyDamage(MonitorType.Physical, remainder);
			}
		}

		if (physicalDamage > 0) {
			const remainder: number = await this._applyDamage(MonitorType.Physical, value);
			if (remainder > 0) {
				overflowDamage = await this._applyDamage(MonitorType.Overflow, remainder);
			}
		}

		if (overflowDamage > 0) {
			const remainder: number = await this._applyDamage(MonitorType.Physical, value);
			if (remainder > 0) {
				// They are dead
			}
		}
	}

	async gainEdge(count: number): Promise<boolean> {
		this.edge.damage = Math.max(0, (this.edge.damage -= count));
		await this.actor!.update({ ['system.monitors.edge.damage']: this.edge.damage });

		return true;
	}

	async spendEdge(count: number): Promise<boolean> {
		if (this.edge.value < count) {
			return false;
		}

		this.edge.damage += count;
		await this.actor!.update({ ['system.monitors.edge.damage']: this.edge.damage });

		return true;
	}

	prepareWoundModifier(): void {
		let physicalWoundModifier = this.actor!.modifiers.all.find(
			(modifier) =>
				modifier.class === 'WoundModifier' && modifier.data.name === 'SR6.Modifiers.PhysicalWoundModifier.Name',
		) as WoundModifier | undefined;
		let stunWoundModifier = this.actor!.modifiers.all.find(
			(modifier) =>
				modifier.class === 'WoundModifier' && modifier.data.name === 'SR6.Modifiers.StunWoundModifier.Name',
		) as WoundModifier | undefined;

		if (!physicalWoundModifier && this.physical.woundModifier !== 0) {
			physicalWoundModifier = new WoundModifier({
				parent: this.actor!,
				source: this.actor!,
				target: ModifierTarget.Actor,
				data: { name: 'SR6.Modifiers.PhysicalWoundModifier.Name', value: this.physical.woundModifier },
			});
			this.actor!.modifiers.all.push(physicalWoundModifier as unknown as IModifier);
		}
		if (!stunWoundModifier && this.stun.woundModifier !== 0) {
			stunWoundModifier = new WoundModifier({
				parent: this.actor!,
				source: this.actor!,
				target: ModifierTarget.Actor,
				data: { name: 'SR6.Modifiers.StunWoundModifier.Name', value: this.stun.woundModifier },
			});
			this.actor!.modifiers.all.push(stunWoundModifier as unknown as IModifier);
		}

		// Update them

		if (physicalWoundModifier && this.physical.woundModifier > 0) {
			physicalWoundModifier.data!.value = this.physical.woundModifier;
		}

		if (stunWoundModifier && this.stun.woundModifier > 0) {
			stunWoundModifier.data!.value = this.stun.woundModifier;
		}
	}

	override prepareBaseData(): void {
		this.physical.prepareBaseData();
		this.stun.prepareBaseData();
		this.overflow.prepareBaseData();
		this.edge.prepareBaseData();
	}

	override prepareData(): void {
		this.physical.prepareData();
		this.stun.prepareData();
		this.overflow.prepareData();
		this.edge.prepareData();
	}

	override prepareDerivedData(): void {
		this.physical.prepareDerivedData();
		this.stun.prepareDerivedData();
		this.overflow.prepareDerivedData();
		this.edge.prepareDerivedData();

		this.prepareWoundModifier();
	}

	override getRollData(): Record<string, unknown> {
		return {
			stun: this.stun.getRollData(),
			physical: this.physical.getRollData(),
			overflow: this.overflow.getRollData(),
			edge: this.edge.getRollData(),
		};
	}

	static defineSchema(): foundry.data.fields.DataSchema {
		const fields = foundry.data.fields;

		return {
			stun: new fields.EmbeddedDataField(MonitorDataModel, {
				initial: { damage: 0, max: 0, formula: '8 + ceil(@body / 2)' },
				required: true,
				nullable: false,
			}),
			physical: new fields.EmbeddedDataField(MonitorDataModel, {
				initial: { damage: 0, max: 0, formula: '8 + ceil(@body / 2)' },
				required: true,
				nullable: false,
			}),
			overflow: new fields.EmbeddedDataField(MonitorDataModel, {
				initial: { damage: 0, max: 32, formula: null },
				required: true,
				nullable: false,
			}),
			edge: new fields.EmbeddedDataField(MonitorDataModel, {
				initial: { damage: 0, max: 5, formula: '@edge' },
				required: true,
				nullable: false,
			}),
		};
	}
}
