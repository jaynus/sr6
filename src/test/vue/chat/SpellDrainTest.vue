/* eslint-disable vue/multi-word-component-names */
<script lang="ts" setup>
import { SpellDrainTest } from '@/test/SpellTests';
import FloatCollapse from '@/vue/components/FloatCollapse.vue';
import Localized from '@/vue/components/Localized.vue';
import { ref, toRaw } from 'vue';

const emit = defineEmits<{
	(e: 'setText', value: { title: string; hint: string }): void;
}>();

const props = defineProps<{
	test: SpellDrainTest;
}>();

const visibility = ref({
	description: false,
	drainFormula: false,
});

const actionName = ref(props.test.opposedTest.spell.name);
const _actionDescription = ref(props.test.opposedTest.spell.systemData.description);

emit('setText', {
	title: `Resist Drain (${actionName.value})`,
	hint: ``,
});
</script>

<template>
	<div class="flexrow chat-spell-defense-test">
		<div class="attack-details">
			<a
				@mouseenter.prevent="visibility.drainFormula = true"
				@mouseleave.prevent="visibility.drainFormula = false"
				><Localized label="SR6.Magic.Drain" />: <i class="dv">{{ toRaw(test).drain }}</i></a
			>
			<FloatCollapse class="formula" :when="visibility.drainFormula">
				{{ toRaw(test).data.threshold }} - {{ toRaw(test).roll?.hits }} = {{ toRaw(test).drain }}
			</FloatCollapse>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.chat-spell-defense-test {
	font-size: 12px;

	.attack-details {
		padding-top: 5px;
		padding-bottom: 5px;
		min-width: 100%;
	}
}
</style>
