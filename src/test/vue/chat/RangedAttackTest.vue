/* eslint-disable vue/multi-word-component-names */
<script lang="ts" setup>
import { isTargetOwner } from '@/test/AttackTestData';
import { RangedAttackTest } from '@/test/RangedTests';
import { getSelfActor, getSelfOrSelectedActors } from '@/util';
import Targets from '@/chat/vue/Targets.vue';
import FloatCollapse from '@/vue/components/FloatCollapse.vue';
import Localized from '@/vue/components/Localized.vue';
import { toRaw, ref } from 'vue';

const props = defineProps<{
	test: RangedAttackTest;
}>();

const emit = defineEmits<{
	(e: 'setText', value: { title: string; hint: string }): void;
}>();
const showRoll = ref(true);
const visibility = ref({
	description: {
		distance: false,
		damage: false,
		firemode: false,
	},
});

async function executeOpposedTest() {
	if (!game.user!.isGM) {
		const result = await toRaw(props.test).opposed?.(getSelfActor()).execute();
		showRoll.value = !result.ok;
	} else {
		for (const actor of getSelfOrSelectedActors()) {
			await toRaw(props.test).opposed?.(actor).execute();
		}
	}
}

emit('setText', {
	title: `Roll Attack (${props.test.weapon.name})`,
	hint: `asdfasdfasdf`,
});
</script>

<template>
	<div class="flexrow chat-ranged-attack">
		<div class="attack-details">
			<div class="damage">
				<a
					@mouseenter.prevent="visibility.description.damage = true"
					@mouseleave.prevent="visibility.description.damage = false"
				>
					<Localized label="SR6.Combat.Damage" />:

					<i class="dv">{{ toRaw(test).damage }} {{ toRaw(test.weapon).systemData.damageData.damageType }}</i>
					&nbsp;
				</a>
				<FloatCollapse class="formula" :when="visibility.description.damage">
					{{ toRaw(test).baseDamage }} + {{ test.roll?.hits }} = {{ toRaw(test).damage }}
				</FloatCollapse>
			</div>
			<div class="distance">
				<a
					@mouseenter.prevent="visibility.description.distance = true"
					@mouseleave.prevent="visibility.description.distance = false"
				>
					<Localized label="SR6.Combat.Distance" />:
					<Localized
						class="data-value"
						label="SR6.Combat.Distances.{key}"
						:args="{ key: test.data.distance! }"
					/>
				</a>
				<FloatCollapse :when="visibility.description.distance">
					<Localized
						class="formula"
						label="SR6.Combat.DistanceDescriptions.{key}"
						:args="{ key: test.data.distance! }"
					/>
				</FloatCollapse>
			</div>
			<div class="firemode">
				<a
					@mouseenter.prevent="visibility.description.firemode = true"
					@mouseleave.prevent="visibility.description.firemode = false"
				>
					<Localized label="SR6.Combat.FireMode" />:
					<Localized
						class="data-value"
						label="SR6.Combat.FireModes.{key}.Name"
						:args="{ key: test.data.firemode! }"
					/>
				</a>
				<FloatCollapse :when="visibility.description.firemode">
					<Localized
						class="formula"
						label="SR6.Combat.FireModes.{key}.Description"
						:args="{ key: test.data.firemode! }"
					/>
				</FloatCollapse>
			</div>
		</div>
		<Targets v-if="test.targets.length > 0" :targets="test.targets" />
		<input
			v-if="showRoll && isTargetOwner(test.data)"
			class="dialog-button chat-toggled-button"
			type="button"
			value="Roll Defense"
			@click.prevent="executeOpposedTest"
		/>
	</div>
</template>

<style lang="scss" scoped>
.chat-ranged-attack {
	font-size: 12px;

	.attack-details {
		padding-top: 5px;
		padding-bottom: 5px;
		min-width: 100%;
	}
}
</style>
