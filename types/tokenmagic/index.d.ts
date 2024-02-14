type Filter = {
	filterType: string;
	filterId: string;
	distance: number;
	outerStrength: number;
	color: number;
	padding: number;
	animated: {
		color: {
			active: boolean;
			loopDuration: number;
			animType: string;
			val1: number;
			val2: number;
		};
	};
};

declare class TokenMagic {
	addPreset(presetName: string, filters: Filter[], silent?: boolean): void;
	deletePreset(presetName: string, filters: Filter[], silent?: boolean): void;
	getPreset(presetName: string): Filter | undefined;

	getPresets(libraryName?: string): undefined | Filter[];
	resetPresetLibrary(): void;
	exportPresetLibrary(exportName?: string): void;
	importPresetLibrary(): void;
	importPresetLibraryFromPath(path: string): void;
	importPresetLibraryFromURL(path: string): void;

	addFilters(objects: PlaceableObject[], filters: Filter[], replace?: boolean): void;
	addFilters(objects: PlaceableObject[], preset: string, replace?: boolean): void;

	addFiltersOnSelected(filters: Filter[], replace?: boolean): void;
	addFiltersOnSelected(preset: string, replace?: boolean): void;

	addFiltersOnTargeted(filters: Filter[], replace?: boolean): void;
	addFiltersOnSelected(preset: string, replace?: boolean): void;

	deleteFilters(objects: PlaceableObject[]): void;
	deleteFiltersOnSelected(filters: Filter[]): void;
	deleteFiltersOnTargeted(filters: Filter[]): void;

	updateFiltersOnSelected(filters: Filter[]): Promise<void>;
	updateFiltersOnTargeted(filters: Filter[]): Promise<void>;
	updateFiltersByPlaceable(filters: Filter[], objects: PlaceableObject[]): Promise<void>;
}

interface ITMFXPlaceable {
	TMFXaddFilters(filters: Filter[]): Promise<void>;
	TMFXupdateFilters(filters: Filter[]): Promise<void>;
	TMFXaddUpdateFilters(filters: Filter[]): Promise<void>;
	TMFXdeleteFilters(filters?: Filter[]): Promise<void>;

	TMFXhasFilterType(filterType: string): boolean;
	TMFXhasFilterId(filterId: string): boolean;
}
