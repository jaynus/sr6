import SR6Actor from '@/actor/SR6Actor';
import { Distance } from '@/data';
import { BaseTestData } from '@/test/BaseTest';
import { getActorSync } from '@/util';

export interface AttackTestData extends BaseTestData {
	targetIds?: ActorUUID[];
	damage?: number;
	attackRating?: number;
}

export interface PhysicalAttackTestData extends AttackTestData {
	distance?: Distance;
}

export function getAttackDataTargets(data: AttackTestData): SR6Actor[] {
	if (!data || Object.prototype.hasOwnProperty.call(data, 'targetIds') || !data.targetIds) {
		return [];
	}

	return data.targetIds
		.map((id) => getActorSync(SR6Actor, id))
		.filter((actor) => actor !== null)
		.map((actor) => actor!);
}

export function isTargetOwner(data: AttackTestData): boolean {
	const targets = getAttackDataTargets(data);
	if (targets.length === 0) {
		return true;
	}
	return targets.find((target: SR6Actor) => target.isOwner) !== undefined;
}
