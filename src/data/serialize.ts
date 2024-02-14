import { Err, Ok, Result } from 'ts-results';

export type ClassData = {
	class?: string;
} & Record<string, unknown>;

export function getClass<T>(types: Record<string, unknown>, data: ClassData): Result<T, string> {
	if (!data.class) {
		return Err('No class name specified');
	}
	if (!types[data.class]) {
		return Err(`Shadowrun 6e | Tried getting a Test Class ${data.class}, which isn't registered in ${types}`);
	}

	return Ok(types[data.class] as T);
}
