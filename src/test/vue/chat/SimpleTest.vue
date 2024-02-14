/* eslint-disable vue/multi-word-component-names */
<script lang="ts" setup>
import { TestType } from '@/test';
import BaseTest from '@/test/BaseTest';

const emit = defineEmits<{
	(e: 'setText', value: { title: string; hint: string }): void;
}>();

const props = defineProps<{
	test: BaseTest;
}>();

switch (props.test.type) {
	case TestType.LiftCarry:
		emit('setText', {
			title: game.i18n.localize('SR6.SimpleTests.LiftCarry.Name'),
			hint: game.i18n.localize('SR6.SimpleTests.LiftCarry.Description'),
		});
		break;
	case TestType.Composure:
		emit('setText', {
			title: game.i18n.localize('SR6.SimpleTests.Composure.Name'),
			hint: game.i18n.localize('SR6.SimpleTests.Composure.Description'),
		});
		break;
	case TestType.JudgeIntentions:
		emit('setText', {
			title: game.i18n.localize('SR6.SimpleTests.JudgeIntentions.Name'),
			hint: game.i18n.localize('SR6.SimpleTests.JudgeIntentions.Description'),
		});
		break;
}
</script>

<template>
	<div class="flexrow chat-simple-test">
		<div class="details"></div>
	</div>
</template>

<style lang="scss" scoped>
.chat-simple-test {
	font-size: 12px;

	.details {
		padding-top: 5px;
		padding-bottom: 5px;
		min-width: 100%;
	}
}
</style>
