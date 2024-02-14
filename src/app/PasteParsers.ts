import CharacterDataModel from '@/actor/data/CharacterDataModel';
import SR6Actor from '@/actor/SR6Actor';
import { getCoreSkills } from '@/item/data';
import { Result } from 'ts-results';

export enum MOBMASTER_IDX {
	body = 12,
	agility = 13,
	reaction = 14,
	strength = 15,
	willpower = 16,
	logic = 17,
	intuition = 18,
	charisma = 19,
	essence = 20,
}

export async function mobMasterParse(raw: string): Promise<Result<SR6Actor, string>> {
	const split = raw.split('\n');
	const name = `${split[0]}, ${split[1]}`;

	const actor = (await Actor.create({
		name,
		type: 'character',
	})) as SR6Actor<CharacterDataModel>;
	await actor.createEmbeddedDocuments('Item', await getCoreSkills());

	await actor.update({
		['system.attributes']: {
			body: {
				base: parseInt(split[MOBMASTER_IDX.body]),
			},
			agility: {
				base: parseInt(split[MOBMASTER_IDX.agility]),
			},
			reaction: {
				base: parseInt(split[MOBMASTER_IDX.reaction]),
			},
			strength: {
				base: parseInt(split[MOBMASTER_IDX.strength]),
			},
			willpower: {
				base: parseInt(split[MOBMASTER_IDX.willpower]),
			},
			logic: {
				base: parseInt(split[MOBMASTER_IDX.logic]),
			},
			intuition: {
				base: parseInt(split[MOBMASTER_IDX.intuition]),
			},
			charisma: {
				base: parseInt(split[MOBMASTER_IDX.charisma]),
			},
			essence: {
				base: parseInt(split[MOBMASTER_IDX.essence]),
			},
		},
	});

	const skillsText = split.find((s) => s.startsWith('Skills'));
	if (skillsText) {
		// const skillsSplit = skillsText.split(',');
	}

	throw 'err';
}

const _test =
	'Mook #579\n' +
	'Male Human, Rating 1 Gang Member\n' +
	'BOD\n' +
	'AGI\n' +
	'REA\n' +
	'STR\n' +
	'WIL\n' +
	'LOG\n' +
	'INT\n' +
	'CHA\n' +
	'ESS\n' +
	'4\n' +
	'4\n' +
	'3\n' +
	'4\n' +
	'3\n' +
	'2\n' +
	'3\n' +
	'3\n' +
	'6\n' +
	'Initiative\n' +
	'6 + 1D6 [Major 1/minor 1]\n' +
	'Defense Rating\n' +
	'7\n' +
	'Defense Test\n' +
	'Base 6 / Block 9 / Dodge 6\n' +
	'Damage Resistance\n' +
	'4\n' +
	'Condition Monitor\n' +
	'10\n' +
	'Qualities\n' +
	'Toughness\n' +
	'Skills\tInfluence 3, Firearms 4, Close Combat 3\n' +
	'Armor\n' +
	'Armor Vest (3)\n' +
	'Gear\t\n' +
	'Knife [Close Combat, Reach 0, DV (STR + 2)P, AR 6/1*/-/-/-]\n' +
	'Browning Ultra-Power [Heavy Pistol, DV 3P, SA, AR 10/9/6/-/-, 10(c)]\n' +
	'Meta Link commlink (DR 1)';
