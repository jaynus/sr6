/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
	root: true,
	'extends': [
		'plugin:vue/vue3-essential',
		'eslint:recommended',
		'@vue/eslint-config-typescript',
		'@vue/eslint-config-prettier/skip-formatting',
	],
	'plugins': ['prettier', '@typescript-eslint'],
	'parserOptions': {
		'parser': '@typescript-eslint/parser',
		'ecmaVersion': 'latest',
		'sourceType': 'module',
		'project': 'tsconfig.json'
	},
	'ignorePatterns': ['dist/**'],
	'rules': {
		'@typescript-eslint/no-floating-promises': ['error'],
		'vue/no-mutating-props': 'off',
		'vue/multi-word-component-names': 'off',
		'eqeqeq': 'error',
		'prettier/prettier': 'error',
		'no-console': 'off',
		'no-plusplus': [
			'error',
			{
				'allowForLoopAfterthoughts': true
			}
		],
		'no-unused-expressions': [
			'error',
			{
				'allowShortCircuit': true
			}
		],
		'spaced-comment': [
			'error',
			'always',
			{
				'markers': ['/']
			}
		],
		'@typescript-eslint/await-thenable': 'error',
		'@typescript-eslint/ban-ts-comment': 'error',
		'@typescript-eslint/ban-types': 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'error',
		'@typescript-eslint/lines-between-class-members': [
			'error',
			'always',
			{
				'exceptAfterSingleLine': true
			}
		],
		'@typescript-eslint/prefer-namespace-keyword': 'off',
		'@typescript-eslint/no-empty-function': 'off',
		'@typescript-eslint/no-explicit-any': 'error',
		'@typescript-eslint/no-namespace': [
			'error',
			{
				'allowDeclarations': true
			}
		],
		'@typescript-eslint/no-non-null-assertion': 'off',
		'@typescript-eslint/no-unsafe-declaration-merging': 'off',
		'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
		'vue/no-unused-vars': ['error', { 'ignorePattern': '^_' }],
		'@typescript-eslint/array-type': [
			'error',
			{
				'default': 'array'
			}
		],
		//'indent': ['error', 'tab', { SwitchCase: 1 }]
	}
}
