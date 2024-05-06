export class SR6Layer extends PlaceablesLayer {
	static override documentName: string = 'Scene';

	constructor() {
		super();
	}

	static override get layerOptions() {
		return foundry.utils.mergeObject(super.layerOptions, {
			zIndex: 180,
			name: 'sr6',
		});
	}

	override getDocuments(): never[] {
		return [];
	}
}
