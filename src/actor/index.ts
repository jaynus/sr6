/**
 *
 * @author jaynus
 * @file SR6 Actors root.
 */

import DroneDataModel from '@/actor/data/DroneDataModel';
import MatrixHostDataModel from '@/actor/data/MatrixHostDataModel';
import SpriteDataModel from '@/actor/data/SpriteDataModel';
import VehicleDataModel from '@/actor/data/VehicleDataModel';
import { register as registerSheets } from '@/actor/sheets';
import CharacterDataModel from '@/actor/data/CharacterDataModel';

import SR6Actor from '@/actor/SR6Actor';

export async function onCreate(actor: Actor): Promise<void> {
	return (actor as unknown as SR6Actor)._onPostCreate();
}

export function register(): void {
	CONFIG.Actor.documentClass = SR6Actor;

	registerDataModels();
	registerSheets();
}

function registerDataModels(): void {
	CONFIG.Actor.dataModels.character = CharacterDataModel;
	CONFIG.Actor.dataModels.matrix_host = MatrixHostDataModel;
	CONFIG.Actor.dataModels.vehicle = VehicleDataModel;
	CONFIG.Actor.dataModels.drone = DroneDataModel;
	CONFIG.Actor.dataModels.sprite = SpriteDataModel;
}

export function setOptGroups(_select: HTMLSelectElement): void {}
