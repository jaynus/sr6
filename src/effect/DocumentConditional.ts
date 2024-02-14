export interface Data {
	origin?: object;
	target?: object;
}

export function check(
	origin: foundry.abstract.Document | null,
	target: foundry.abstract.Document,
	data: object | undefined,
): boolean {
	const compare = data as Data;
	// If not equal return true, as its a failure
	if (compare.origin) {
		if (!origin) {
			return false;
		}
		if (!foundry.utils.objectsEqual(foundry.utils.filterObject(origin, compare.origin!), compare.origin!)) {
			return false;
		}
	}
	if (compare.target) {
		if (!foundry.utils.objectsEqual(foundry.utils.filterObject(target, compare.target!), compare.target!)) {
			return false;
		}
	}

	return true;
}
