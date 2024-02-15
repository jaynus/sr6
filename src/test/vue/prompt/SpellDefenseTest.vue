/* eslint-disable vue/multi-word-component-names */
<script lang="ts" setup>
import { SpellDefenseTest } from '@/test/SpellTests';
import { ref } from 'vue';

const props = defineProps<{
	test: SpellDefenseTest;
}>();

const emit = defineEmits<{
	(e: 'setText', value: { title: string; hint: string }): void;
}>();

const actionName = ref(props.test.opposedTest.spell.name);
const actionDescription = ref(props.test.opposedTest.spell.systemData.description);

emit('setText', {
	title: `Spell Defense (${actionName.value})`,
	hint: ``,
});
</script>

<template>
	<div class="flexcol spell-cast-test-prompt">
		<div class="section">
			<div class="section-title">Description</div>
			{{ actionDescription }}
		</div>
	</div>
</template>

<style lang="scss" scoped>
.spell-cast-test-prompt {
	font-size: 12px;
}
</style>
