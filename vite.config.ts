import { AliasOptions, defineConfig } from 'vite';
import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import pluginVue from '@vitejs/plugin-vue';
import path from 'path';
import process from 'process';
import FullReload from 'vite-plugin-full-reload';
import checker from 'vite-plugin-checker';
import tsconfigPaths from 'vite-tsconfig-paths';

const env = dotenv.config();
dotenvExpand.expand(env);

const PROXY_HOST = process.env.VITE_PROXY_HOST ?? 'localhost';
const PROXY_PORT = process.env.VITE_PROXY_PORT ?? 30000;

/**
 * A list of aliases to be applied only in production.
 */
let releaseOnlyAliases: AliasOptions = [];

let devOnlyAliases: AliasOptions = [];

if (process.env.NODE_ENV === 'production') {
	releaseOnlyAliases = [{ find: 'vue', replacement: path.resolve(__dirname, 'external/vue.esm-browser.prod.js') }];
} else {
	devOnlyAliases = [];
}

// https://vitejs.dev/config/
export default defineConfig({
	// Proxy w/Foundry. See https://foundryvtt.wiki/en/development/guides/vite
	base: '/systems/sr6',
	server: {
		host: '0.0.0.0',
		port: 30001,
		open: false,
		proxy: {
			'^/assets': `http://${PROXY_HOST}:${PROXY_PORT}/systems/sr6/`,
			'^(?!/systems/sr6)': `http://${PROXY_HOST}:${PROXY_PORT}/`,
			'/socket.io': {
				target: `ws://${PROXY_HOST}:${PROXY_PORT}`,
				ws: true,
			},
		},
	},
	publicDir: 'public',
	build: {
		outDir: 'dist',
		emptyOutDir: true,
		sourcemap: 'inline',
		// Avoiding minification is important, because we don't want names of globals/etc. to be mangled.
		minify: false,
		lib: {
			name: 'SR6',
			entry: 'src/sr6.ts',
			formats: ['es'], // ES Modules
			fileName: 'sr6',
		},
		rollupOptions: {
			external: /^\/systems.*/,
		},
	},
	plugins: [checker({ typescript: true }), tsconfigPaths(), pluginVue(), FullReload(['public/**/*'])],
	resolve: {
		alias: [
			{ find: '@', replacement: path.resolve(__dirname, 'src') },
			{ find: '@scss', replacement: path.resolve(__dirname, 'src/scss') },
			...devOnlyAliases,
			...releaseOnlyAliases,
		],
	},
});
