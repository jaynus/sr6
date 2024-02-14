/**
 *
 * @author jaynus
 * @file Actor Sheet Registration
 */

import CharacterSheet from '@/actor/sheets/CharacterSheet';
import DroneSheet from '@/actor/sheets/DroneSheet';

import MatrixHostSheet from '@/actor/sheets/MatrixHostSheet';
import SpriteSheet from '@/actor/sheets/SpriteSheet';
import VehicleSheet from '@/actor/sheets/VehicleSheet';

export function register(): void {
	Actors.unregisterSheet('core', ActorSheet);

	Actors.registerSheet('sr6', CharacterSheet, {
		types: ['character'],
		makeDefault: true,
	});

	Actors.registerSheet('sr6', MatrixHostSheet, {
		types: ['matrix_host'],
		makeDefault: true,
	});

	Actors.registerSheet('sr6', VehicleSheet, {
		types: ['vehicle'],
		makeDefault: true,
	});

	Actors.registerSheet('sr6', DroneSheet, {
		types: ['drone'],
		makeDefault: true,
	});

	Actors.registerSheet('sr6', SpriteSheet, {
		types: ['sprite'],
		makeDefault: true,
	});
}
