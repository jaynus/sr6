import { customAlphabet } from 'nanoid';
import nanod from 'nanoid-dictionary';
import path from 'path';
import fs from 'fs';
import yaml from 'js-yaml';

const { alphanumeric } = nanod;

const nanoid = customAlphabet(alphanumeric, 16);

const PACK_SRC = './packs';

const files = fs.readdirSync(PACK_SRC, { recursive: true }).filter((file) => {
	return file.endsWith('.yml');
});

for (const file of files) {
	const srcpath = path.resolve(PACK_SRC, file);
	const oldYaml = fs.readFileSync(srcpath, { encoding: 'utf8', flag: 'r' });
	const obj = yaml.load(oldYaml);
	if (obj) {
		if (!obj._id) {
			obj._id = nanoid();
		}
		obj._key = `!items!${obj._id}`;

		if (obj.effects && obj.effects.length > 0) {
			obj.effects.forEach((effect) => {
				if (!effect._id) {
					effect._id = nanoid();
				}
				effect._key = `!items.effects!${obj._id}.${effect._id}`;
			});
		}
		let newYaml = yaml.dump(obj);
		if (newYaml !== oldYaml) {
			fs.writeFile(srcpath, newYaml, (err) => {
				if (err) {
					console.log(err);
				}
			});
		}
	} else {
		console.error(`Failed on file: ${srcpath}`);
	}
}
