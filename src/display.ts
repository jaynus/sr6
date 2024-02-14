import { GearAvailabilityDataModel, GearSize } from '@/item/data/gear/GearDataModel';

export function GearAvailabilityToString(avail: GearAvailabilityDataModel): string {
	const rating = avail.rating.toString();
	const legal = avail.illegal ? '(I)' : '';
	const license = avail.requiresLicense ? '(L)' : '';

	return `${rating} ${legal} ${license}`.trim().replace('  ', ' ');
}

export function GearSizeToString(size: GearSize): string {
	return GearSize[size];
}

export function register(): void {
	Handlebars.registerHelper('GearAvailabilityToString', function (avail: GearAvailabilityDataModel) {
		return GearAvailabilityToString(avail);
	});
	Handlebars.registerHelper('GearSizeToString', function (avail: GearSize) {
		return GearSizeToString(avail);
	});
}
