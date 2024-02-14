/* eslint-disable vue/multi-word-component-names */
<script lang="ts" setup>
import { computed } from 'vue';

const props = withDefaults(
	defineProps<{
		/**
		 * Localization key string.
		 */
		label: string;

		title?: string;

		/**
		 * String formatting args.
		 */
		args?: { [key: string]: string | number | boolean | null };

		/**
		 * Class to add to the span
		 */
		class?: string;

		/**
		 * Whether to handle HTML formatting in the localized value.
		 */
		enriched?: boolean;
	}>(),
	{
		enriched: false,
	},
);

const localizedValue = computed(() =>
	props?.args === undefined
		? game.i18n.localize(props.label)
		: game.i18n.localize(game.i18n.format(props.label, props.args)),
);

const localizedTitle = computed(() =>
	props.title !== undefined
		? props?.args === undefined
			? game.i18n.localize(props.title)
			: game.i18n.localize(game.i18n.format(props.title, props.args))
		: '',
);
</script>

<template>
	<span :class="props.class" :title="localizedTitle">
		<span v-if="enriched" v-html="localizedValue"></span>
		<template v-else>{{ localizedValue }}</template>
	</span>
</template>
