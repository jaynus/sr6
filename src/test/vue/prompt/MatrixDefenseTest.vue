/* eslint-disable vue/multi-word-component-names */
<script lang="ts" setup>
import { MatrixDefenseTest } from '@/test/MatrixTests';
import { ref } from 'vue';

const props = defineProps<{
	test: MatrixDefenseTest;
}>();

const emit = defineEmits<{
	(e: 'setText', value: { title: string; hint: string }): void;
}>();

const actionName = ref(props.test.opposedTest.matrixAction.name);
const actionDescription = ref(props.test.opposedTest.matrixAction.systemData.description);

emit('setText', {
	title: `Matrix Defense (${actionName.value})`,
	hint: ``,
});
</script>

<template>
	<div class="flexcol matrix-action-test-prompt">
		<div class="section">
			<div class="section-title">Description</div>
			{{ actionDescription }}
		</div>
	</div>
</template>

<style lang="scss" scoped>
.matrix-action-test-prompt {
	font-size: 12px;
}
</style>
