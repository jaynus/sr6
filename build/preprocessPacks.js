import { customAlphabet } from 'nanoid';
import nanod from 'nanoid-dictionary';
import path from 'path';
import fs from 'fs';
import yaml from 'js-yaml';

const { alphanumeric } = nanod;

const nanoid = customAlphabet(alphanumeric, 16);

const PACK_SRC = './packs';

async function createMissingIds() {
	const files = fs.readdirSync(PACK_SRC, { recursive: true }).filter((file) => {
		return file.endsWith('.yml');
	});

	for (const file of files) {
		const srcpath = path.resolve(PACK_SRC, file);
		const oldYaml = fs.readFileSync(srcpath, { encoding: 'utf8', flag: 'r' });
		const obj = yaml.load(oldYaml);
		if (obj) {
			if (obj._key && obj._key.includes('!folders!')) {
				continue;
			}

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
}

async function createMissingFolders() {
	const packs = fs.readdirSync(PACK_SRC);
	for (const pack of packs) {
		const packPath = path.resolve(PACK_SRC, pack);
		const folders = fs
			.readdirSync(packPath)
			.filter((file) => {
				const filePath = path.resolve(packPath, file);
				return fs.lstatSync(filePath).isDirectory();
			})
			.map((folder) => {
				return { name: folder, path: path.resolve(packPath, folder) };
			});

		// Iterate folders in this pack
		for (const folder of folders) {
			const folderYamlPath = `${folder.path}.yml`;
			let folderId = nanoid();

			// Does a folder entry for this exist?
			if (!fs.existsSync(folderYamlPath)) {
				const folderEntry = {
					name: folder.name,
					sorting: 'a',
					folder: null,
					type: 'Item',
					_id: folderId,
					sort: 0,
					color: null,
					flags: {},
					_key: `!folders!${folderId}`,
				};

				fs.writeFileSync(folderYamlPath, yaml.dump(folderEntry), (err) => {
					if (err) {
						console.log(err);
					}
				});
			} else {
				// load the yaml and get the id
				folderId = yaml.load(fs.readFileSync(folderYamlPath, { encoding: 'utf8', flag: 'r' }))._id;
			}

			// Check that all sub-items have the correct id
			const files = fs
				.readdirSync(folder.path, { recursive: true })
				.filter((file) => {
					return file.endsWith('.yml');
				})
				.map((file) => path.resolve(folder.path, file));

			for (const file of files) {
				let obj = yaml.load(fs.readFileSync(file, { encoding: 'utf8', flag: 'r' }));

				if (!obj.folder || obj.folder !== folderId) {
					obj.folder = folderId;
					fs.writeFile(file, yaml.dump(obj), (err) => {
						if (err) {
							console.log(err);
						}
					});
				}
			}
		}
	}
}

await createMissingFolders();
await createMissingIds();
