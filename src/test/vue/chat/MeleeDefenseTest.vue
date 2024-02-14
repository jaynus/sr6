/* eslint-disable vue/multi-word-component-names */
<script lang="ts" setup>
import { DamageType } from '@/data';
import { MeleeDefenseTest } from '@/test/MeleeTests';
import Localized from '@/vue/components/Localized.vue';
import { toRaw, ref } from 'vue';
import { Collapse } from 'vue-collapsed';
import SR6Item from '@/item/SR6Item';
import WeaponDataModel from '@/item/data/gear/WeaponDataModel';

const emit = defineEmits<{
	(e: 'setText', value: { title: string; hint: string }): void;
}>();
const props = defineProps<{
	test: MeleeDefenseTest;
}>();

const visibility = ref({
	damageFormula: false,
});
const showRoll = ref(true);

async function executeSoakTest() {
	const result = await toRaw(props.test.opposedTest).soak(toRaw(props.test)).execute();
	if (result.ok && !game.user!.isGM) {
		showRoll.value = false;
	}
}

function getDamageTypeForTest(test: MeleeDefenseTest): DamageType {
	return toRaw(test.opposedTest.item! as SR6Item<WeaponDataModel>).systemData.damageData.damageType;
}

emit('setText', {
	title: `Defense (Against ${props.test.opposedTest.actor.name})`,
	hint: ``,
});
</script>

<template>
	<div class="flexrow chat-opposed-test">
		<div class="line">
			Defending against {{ test.opposedTest.actor.name }} using {{ test.opposedTest.item?.name }}
		</div>
		<div v-if="!test.roll?.success">
			<hr />
			<div v-if="test.opposedTest.damage" class="line">
				<a
					@mouseenter.prevent="visibility.damageFormula = true"
					@mouseleave.prevent="visibility.damageFormula = false"
				>
					<Localized label="SR6.Combat.Damage" />:

					<i class="dv">{{ props.test.damage }} {{ getDamageTypeForTest(test) }}</i>
				</a>
				<Collapse class="formula" :when="visibility.damageFormula">
					{{ toRaw(test.opposedTest).damage }} - {{ test.roll?.hits }} =
					{{ props.test.damage }}
				</Collapse>
			</div>
		</div>
		<input
			v-if="showRoll && test.isOwner && !test.roll?.success"
			class="dialog-button line"
			type="button"
			value="Soak Damage"
			@click.prevent="executeSoakTest"
		/>
	</div>
</template>

<style lang="scss" scoped>
.chat-opposed-test {
	padding-top: 5px;
	font-size: 12px;
}
</style>
