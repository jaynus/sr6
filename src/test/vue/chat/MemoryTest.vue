/* eslint-disable vue/multi-word-component-names */
<script lang="ts" setup>
import { MemoryTest } from '@/test/MemoryTests';

const props = defineProps<{
	test: MemoryTest;
}>();

const emit = defineEmits<{
	(e: 'setText', value: { title: string; hint: string }): void;
}>();

// const knowledge = ref<SR6Item<KnowledgeDataModel>>(toRaw(props.test.actor).);
// const skillName = ref<string>(props.test.data.skillUse.specialization || props.test.data.skillUse.skill);

emit('setText', {
	title: props.test.knowledge ? `Knowledge (${props.test.knowledge.name})` : 'Memory Test',
	hint: ``,
});
</script>

<template>
	<div class="flexrow memory-test"></div>
</template>

<style lang="scss" scoped>
.memory-test {
	font-size: 12px;

	.details {
		padding-top: 5px;
		padding-bottom: 5px;
		min-width: 100%;
	}
}
</style>
