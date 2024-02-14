import { DocumentUUIDField } from '@/data/fields';
import { IHasOnDelete } from '@/data/interfaces';
import QualityDataModel from '@/item/data/feature/QualityDataModel';
import { GearAvailabilityDataModel } from '@/item/data/gear/GearDataModel';
import SR6Item from '@/item/SR6Item';
import { getItem, getItemSync } from '@/util';

export enum AugmentationVisibility {
	Synthetic = 'synthetic',
	Obvious = 'obvious',
}

export default abstract class AugmentationDataModel
	extends QualityDataModel
	implements IHasOnDelete<SR6Item<QualityDataModel>>
{
	abstract rating: number;
	abstract quality: number;
	abstract visibility: AugmentationVisibility;

	abstract costFormula: string;
	abstract availability: GearAvailabilityDataModel;

	abstract essenceCostFormula: string;

	abstract sourceGearIds: ItemUUID[];
	abstract _attachedGearIds: ItemUUID[];

	get cost(): number {
		return this.solveFormula(this.costFormula);
	}

	get essenceCost(): number {
		return this.solveFormula(this.essenceCostFormula);
	}

	override getRollData(): Record<string, unknown> {
		return {
			...super.getRollData(),
			rating: this.rating,
			quality: this.quality,
		};
	}

	override async onPostCreate(): Promise<void> {
		await super.onPostCreate();

		for (const gearId of this.sourceGearIds) {
			const item = await getItem(SR6Item, gearId);
			if (!item) {
				ui.notifications.error(`Failed to find proxy item for ${this.item!.name} (${gearId})`);
				return;
			}

			const attachedGear = (await this.actor!.createEmbeddedDocuments('Item', [item])) as SR6Item[];
			this._attachedGearIds.push(attachedGear[0].uuid);
		}
		await this.item!.update({ ['system._attachedGearIds']: this._attachedGearIds });
	}

	override onDelete(
		_document: SR6Item<QualityDataModel>,
		_options: DocumentModificationContext<SR6Item<QualityDataModel>>,
		_userId: string,
	): void {
		this._attachedGearIds.forEach((uuid) => {
			const item = getItemSync(SR6Item, uuid);
			if (item) {
				void item.delete();
			}
		});
	}

	static override defineSchema(): foundry.data.fields.DataSchema {
		const fields = foundry.data.fields;
		return {
			...super.defineSchema(),
			rating: new fields.NumberField({
				initial: 1,
				required: true,
				nullable: false,
				integer: true,
				min: 1,
				max: 12,
			}),
			quality: new fields.NumberField({
				initial: 1,
				required: true,
				nullable: false,
				integer: true,
				min: 1,
				max: 6,
			}),
			visibility: new fields.StringField({
				initial: AugmentationVisibility.Synthetic,
				nullable: false,
				required: true,
				blank: false,
				choices: Object.values(AugmentationVisibility),
			}),
			essenceCostFormula: new fields.StringField({ initial: '0', nullable: false, required: true, blank: false }),

			costFormula: new fields.StringField({ initial: '0', nullable: false, required: true, blank: false }),
			availability: new fields.EmbeddedDataField(GearAvailabilityDataModel, { required: true, nullable: false }),

			sourceGearIds: new fields.ArrayField(new DocumentUUIDField(), {
				initial: [],
				required: true,
				nullable: false,
			}),
			_attachedGearIds: new fields.ArrayField(new DocumentUUIDField(), {
				initial: [],
				required: true,
				nullable: false,
			}),
		};
	}
}
