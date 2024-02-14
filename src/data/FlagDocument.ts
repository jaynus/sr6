import { ConstructorOf } from '@/util';

export default class FlagDocument<TDataModel extends foundry.abstract.DataModel> {
	name: string;
	type: ConstructorOf<TDataModel>;
	document: foundry.abstract.Document;

	system: TDataModel;

	get systemData(): TDataModel {
		return this.system;
	}

	async save(): Promise<void> {
		await this.document.setFlag('sr6', this.name, this.system.toObject(false));
	}

	prepareBaseData(): void {
		this.system.prepareBaseData();
	}

	prepareData(): void {
		this.system.prepareData();
	}

	prepareDerivedData(): void {
		this.system.prepareDerivedData();
	}

	constructor(document: foundry.abstract.Document, type: ConstructorOf<TDataModel>, name: string) {
		this.document = document;
		this.type = type;
		this.name = name;

		let data = this.document.getFlag('sr6', this.name);
		if (!data) {
			data = {};
		}

		this.system = new this.type(data, { parent: document });
	}
}
