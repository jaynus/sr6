/* eslint-disable vue/multi-word-component-names */
<script lang="ts" setup>
import { MatrixDefenseTest } from '@/test/MatrixTests';
import FloatCollapse from '@/vue/components/FloatCollapse.vue';
import Localized from '@/vue/components/Localized.vue';
import { ref, toRaw } from 'vue';

const props = defineProps<{
	test: MatrixDefenseTest;
}>();

const emit = defineEmits<{
	(e: 'setText', value: { title: string; hint: string }): void;
}>();

const visibility = ref({
	description: false,
	damageFormula: false,
});

const actionName = ref(props.test.opposedTest.matrixAction.name);
const _actionDescription = ref(props.test.opposedTest.matrixAction.systemData.description);

async function executeSoakTest() {
	await toRaw(props.test.opposedTest).soak(toRaw(props.test)).execute();
}

emit('setText', {
	title: `Defend (Against ${actionName.value})`,
	hint: ``,
});
</script>

<template>
	<div class="flexrow chat-matrix-defense-test">
		<div class="attack-details">
			<div class="line">
				Defending against {{ test.opposedTest.actor.name }} using {{ test.opposedTest.matrixAction.name }}
			</div>
			<div class="damage" v-if="!test.roll?.success">
				<a
					@mouseenter.prevent="visibility.damageFormula = true"
					@mouseleave.prevent="visibility.damageFormula = false"
				>
					<Localized label="SR6.Combat.Damage" />:

					<i class="dv">{{ toRaw(test).damage }}</i>
					&nbsp;
				</a>
				<FloatCollapse class="formula" :when="visibility.damageFormula">
					{{ toRaw(test).baseDamage }} + {{ test.opposedTest.roll?.hits }} - {{ test.roll?.hits }} =
					{{ toRaw(test).damage }}
				</FloatCollapse>
			</div>
		</div>
		<input
			v-if="test.isOwner && !test.roll?.success"
			class="dialog-button line"
			type="button"
			value="Soak Damage"
			@click.prevent="executeSoakTest"
		/>
	</div>
</template>

<style lang="scss" scoped>
.chat-matrix-defense-test {
	font-size: 12px;

	.attack-details {
		padding-top: 5px;
		padding-bottom: 5px;
		min-width: 100%;
	}
}
</style>
