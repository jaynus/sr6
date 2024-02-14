import fs from 'fs';
import gulp from 'gulp';
import path from 'path';
import { compilePack } from '@foundryvtt/foundryvtt-cli';
import child_process from 'child_process';

const { dest, series, src } = gulp;

import gulpClean from 'gulp-clean';
import gulpYaml from 'gulp-yaml';
import gulpZip from 'gulp-zip';

const PACK_SRC = './packs';
const PACK_DST = './dist/packs';

function preprocessPacks() {
	return child_process.exec('node build/preprocessPacks.js');
}

function compilePacks() {
	// determine the source folders to process
	const folders = fs.readdirSync(PACK_SRC).filter((file) => {
		return fs.statSync(path.join(PACK_SRC, file)).isDirectory();
	});

	// process each folder into a compendium db
	const packs = folders.map((folder) => {
		const src = path.resolve(PACK_SRC, folder);
		const dst = path.resolve(PACK_DST, folder);
		return compilePack(src, dst, { yaml: true, recursive: true });
	});

	return Promise.all(packs);
}

export function zip() {
	let version;
	try {
		const systemJsonFile = fs.readFileSync('dist/system.json', { encoding: 'utf8' });
		const systemJson = JSON.parse(systemJsonFile);
		version = systemJson['version'];
	} catch {
		version = 'unknown';
	}

	return src('dist/**/*')
		.pipe(gulpZip(`sr6-${version}.zip`))
		.pipe(dest('.'));
}

export function clean() {
	return src(['public/lang/', 'public/system.json', 'public/template.json'], {
		allowEmpty: true,
	}).pipe(gulpClean());
}

export function cleanPacks() {
	return src(['dist/packs/*'], {
		allowEmpty: true,
	}).pipe(gulpClean());
}

export function data() {
	return src('yaml/**/*.yml').pipe(gulpYaml()).pipe(dest('public/'));
}

function watchDirs() {
	gulp.watch('yaml/**/*.yml', data);
	gulp.watch('packs/**/*.yml', packs);
}

export const packs = series(cleanPacks, preprocessPacks, compilePacks);

export const watch = series(clean, data, packs, watchDirs);
export default series(clean, packs, data);
