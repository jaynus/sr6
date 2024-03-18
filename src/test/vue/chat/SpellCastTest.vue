/* eslint-disable vue/multi-word-component-names */
<script lang="ts" setup>
import LifeformDataModel from '@/actor/data/LifeformDataModel';
import SR6Actor from '@/actor/SR6Actor';
import Targets from '@/chat/vue/Targets.vue';
import { isTargetOwner } from '@/test/AttackTestData';
import { SpellAdjustmentType } from '@/data/magic';
import { damageFromSpellAdjustments, drainFromSpellAdjustments } from '@/item/data/SpellDataModel';
import { TestSourceData } from '@/test/BaseTest';

import { SpellCastTest, SpellCastTestData, SpellDrainTest } from '@/test/SpellTests';
import { getSelfOrSelectedActors } from '@/util';
import FloatCollapse from '@/vue/components/FloatCollapse.vue';
import Localized from '@/vue/components/Localized.vue';
import { ref, toRaw } from 'vue';

const emit = defineEmits<{
	(e: 'setText', value: { title: string; hint: string }): void;
}>();

const props = defineProps<{
	test: SpellCastTest;
}>();

const actionName = ref(props.test.spell.name);
const actionDescription = ref(props.test.spell.systemData.description);

const visibility = ref({
	description: false,
	damageFormula: false,
	drainFormula: false,
});

emit('setText', {
	title: `Spell Cast (${actionName.value})`,
	hint: ``,
});

async function executeOpposedTest() {
	for (const actor of getSelfOrSelectedActors()) {
		await toRaw(props.test)
			.opposed?.(actor as SR6Actor<LifeformDataModel>)
			.execute();
	}
}

async function executeDrainTest() {
	await new SpellDrainTest({
		actor: toRaw(props.test).actor as SR6Actor<LifeformDataModel>,
		item: toRaw(props.test).spell,
		data: { opposedData: toRaw(props.test).toJSON() as unknown as TestSourceData<SpellCastTestData> },
	}).execute();
}

function hasAdjustment() {
	return (
		toRaw(props.test).data.adjustments![SpellAdjustmentType.AmpUp] ||
		toRaw(props.test).data.adjustments![SpellAdjustmentType.IncreaseArea] ||
		toRaw(props.test).data.adjustments![SpellAdjustmentType.ShiftArea]
	);
}
</script>

<template>
	<div class="flexcol chat-spell-cast-test">
		<div class="action-description">
			<a @mouseenter.prevent="visibility.description = true" @mouseleave.prevent="visibility.description = false"
				>Description</a
			>

			{{ actionDescription }}
		</div>
		<div class="attack-details">
			<div class="damage">
				<a
					@mouseenter.prevent="visibility.damageFormula = true"
					@mouseleave.prevent="visibility.damageFormula = false"
				>
					<Localized label="SR6.Combat.Damage" />:

					<i class="dv">{{ toRaw(test).damage }}</i>
					&nbsp;
				</a>
				<FloatCollapse class="formula" :when="visibility.damageFormula">
					{{ toRaw(test).baseDamage }} + {{ damageFromSpellAdjustments(toRaw(test).data.adjustments!) }} +
					{{ test.roll?.hits }} = {{ toRaw(test).damage }}
				</FloatCollapse>
			</div>
			<div class="drain">
				<a
					@mouseenter.prevent="visibility.drainFormula = true"
					@mouseleave.prevent="visibility.drainFormula = false"
					><Localized label="SR6.Magic.Drain" />: <i class="dv">{{ test.data.drain }}</i>
				</a>
				<FloatCollapse class="formula" :when="visibility.drainFormula">
					{{ toRaw(test.spell).systemData.drain }} +
					{{ drainFromSpellAdjustments(toRaw(test).data.adjustments!) }} = {{ test.data.drain }}
				</FloatCollapse>
			</div>
			<div class="chat-head" v-if="hasAdjustment()">Adjustments</div>
			<div v-if="toRaw(test).data.adjustments![SpellAdjustmentType.AmpUp]">
				Amp Up: {{ toRaw(test).data.adjustments![SpellAdjustmentType.AmpUp] }}
			</div>
		</div>
		<Targets v-if="test.targets.length > 0" :targets="test.targets" />
		<input
			v-if="test.isOwner && toRaw(test.spell).systemData.drain > 0"
			class="dialog-button"
			type="button"
			value="Resist Drain"
			@click.prevent="executeDrainTest"
		/>
		<input
			v-if="test.canDefend && isTargetOwner(test.data)"
			class="dialog-button"
			type="button"
			value="Roll Defense"
			@click.prevent="executeOpposedTest"
		/>
	</div>
</template>

<style lang="scss" scoped>
.chat-spell-cast-test {
	font-size: 12px;

	.attack-details {
		padding-top: 5px;
		padding-bottom: 5px;
		min-width: 100%;
	}
}
</style>
