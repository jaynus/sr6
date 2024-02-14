/* eslint-disable vue/multi-word-component-names */
<script lang="ts" setup>
import { TestType } from '@/test';
import BaseTest from '@/test/BaseTest';
import Localized from '@/vue/components/Localized.vue';

const props = defineProps<{
	test: BaseTest;
}>();

const emit = defineEmits<{
	(e: 'setText', value: { title: string; hint: string }): void;
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
	<div class="matrix-action-test-prompt">
		<div class="section" style="width: 76%">
			<div class="section-title"><Localized label="SR6.Labels.Information" /></div>
		</div>
		TODO: Edge Gain
	</div>
</template>

<style lang="scss" scoped>
.matrix-action-test-prompt {
	display: flex;
	flex-flow: wrap;
}
</style>
