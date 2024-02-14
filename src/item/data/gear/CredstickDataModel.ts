import { DocumentUUIDField } from '@/data/fields';
import BaseItemDataModel from '@/item/data/BaseItemDataModel';

export enum CredstickRating {
	Standard = 1,
	Silver = 2,
	Gold = 3,
	Platinum = 4,
	Ebony = 5,
	BankAccount = 6,
}

export enum CredstickCapacity {
	Zero = 0,
	Standard = 5000,
	Silver = 20000,
	Gold = 100000,
	Platinum = 500000,
	Ebony = 1000000,
	BankAccount = 0,
}

export default abstract class CredstickDataModel extends BaseItemDataModel {
	abstract rating: number;
	abstract nuyen: number;

	abstract sin: Maybe<ItemUUID>;

	get capacity(): number {
		return CredstickCapacity[CredstickRating[this.rating as number] as keyof typeof CredstickCapacity];
	}

	validate(_options?: foundry.abstract.DataModelValidationOptions): boolean {
		// TODO:
		return true;
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
				min: CredstickRating.Standard,
				max: CredstickRating.BankAccount,
			}),
			nuyen: new fields.NumberField({ initial: 0, required: true, nullable: false, integer: true, min: 0 }),
			sin: new DocumentUUIDField({ initial: null, required: true, nullable: true }),
		};
	}
}
