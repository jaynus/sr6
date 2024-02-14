import MatrixHostDataModel from '@/actor/data/MatrixHostDataModel';
import { MonitorDataModel } from '@/actor/data/MonitorsDataModel';
import SR6Actor from '@/actor/SR6Actor';
import MatrixActionDataModel from '@/item/data/action/MatrixActionDataModel';
import { MatrixAttributesDataModel } from '@/data/MatrixAttributesDataModel';

export default abstract class MatrixICDataModel extends MatrixActionDataModel {
	abstract monitor: MonitorDataModel;
	protected abstract _host: SR6Actor<MatrixHostDataModel> | null;

	get rating(): number {
		return this.host ? this.host.systemData.rating : 0;
	}

	get attributes(): null | MatrixAttributesDataModel {
		if (this.host) {
			return this.host.systemData.attributes.current;
		}
		return null;
	}

	get host(): null | SR6Actor<MatrixHostDataModel> {
		return this.actor ? (this.actor as SR6Actor<MatrixHostDataModel>) : null;
	}

	override getRollData(): Record<string, unknown> {
		return {
			...super.getRollData(),
			rating: this.rating,
			persona: this.attributes,
		};
	}

	override prepareBaseData(): void {
		this.monitor.prepareBaseData();
	}

	override prepareData(): void {
		this.monitor.prepareData();
	}

	override prepareDerivedData(): void {
		this.monitor.prepareDerivedData();
	}

	static override defineSchema(): foundry.data.fields.DataSchema {
		const fields = foundry.data.fields;

		return {
			...super.defineSchema(),
			monitor: new fields.EmbeddedDataField(MonitorDataModel, {
				initial: { damage: 0, max: 0, formula: '@rating * 2' },
				required: true,
				nullable: false,
			}),
		};
	}
}
