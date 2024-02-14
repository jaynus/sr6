/* eslint-disable vue/multi-word-component-names */
<script lang="ts" setup>
import { MemoryTest } from '@/test/MemoryTests';

const props = defineProps<{
	test: MemoryTest;
}>();

const emit = defineEmits<{
	(e: 'setText', value: { title: string; hint: string }): void;
}>();

emit('setText', {
	title: props.test.knowledge ? `Knowledge (${props.test.knowledge.name})` : 'Memory Test',
	hint: game.i18n.localize('SR6.SimpleTests.Memory.Description'),
});
</script>

<template>
	<div class="flexrow memory-test">
		<div class="details">
			<div class="section-title">Details</div>
			{{ props.test.knowledge?.systemData.description }}
		</div>
	</div>
</template>

<style lang="scss" scoped>
@use '@/scss/sheets';

.memory-test {
	font-size: 12px;

	.details {
		@extend .section;
		padding-top: 5px;
		padding-bottom: 5px;
		min-width: 100%;
	}
}
</style>
