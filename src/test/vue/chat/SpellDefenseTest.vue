/* eslint-disable vue/multi-word-component-names */
<script lang="ts" setup>
import { SpellDefenseTest } from '@/test/SpellTests';
import FloatCollapse from '@/vue/components/FloatCollapse.vue';
import Localized from '@/vue/components/Localized.vue';
import { ref, toRaw } from 'vue';

const emit = defineEmits<{
	(e: 'setText', value: { title: string; hint: string }): void;
}>();

const props = defineProps<{
	test: SpellDefenseTest;
}>();

const visibility = ref({
	description: false,
	damageFormula: false,
});

const actionName = ref(props.test.opposedTest.spell.name);
const _actionDescription = ref(props.test.opposedTest.spell.systemData.description);

emit('setText', {
	title: `Defend (${actionName.value})`,
	hint: ``,
});

async function executeSoakTest() {
	await toRaw(props.test.opposedTest).soak(toRaw(props.test)).execute();
}
</script>

<template>
	<div class="flexrow chat-spell-defense-test">
		<div class="attack-details">
			<div class="damage" v-if="!test.roll?.success">
				<a
					@mouseenter.prevent="visibility.damageFormula = true"
					@mouseleave.prevent="visibility.damageFormula = false"
				>
					<Localized label="SR6.Combat.Damage" />:

					<i class="dv">{{ toRaw(test).damage }}</i>
					&nbsp;
				</a>
				<FloatCollapse class="formula" :when="visibility.damageFormula"> balls </FloatCollapse>
			</div>
		</div>
		<input
			v-if="test.opposedTest.canSoak && test.isOwner && !test.roll?.success"
			class="dialog-button line"
			type="button"
			value="Soak Damage"
			@click.prevent="executeSoakTest"
		/>
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
