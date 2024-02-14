<script lang="ts" setup>
import BaseActorDataModel from '@/actor/data/BaseActorDataModel';
import SR6Actor from '@/actor/SR6Actor';
import { MeleeAttackTest } from '@/test/MeleeTests';

import Localized from '@/vue/components/Localized.vue';

import { computed, toRaw } from 'vue';

const props = defineProps<{
	test: MeleeAttackTest;
}>();

const emit = defineEmits<{
	(e: 'setText', value: { title: string; hint: string }): void;
}>();

const weapon = computed(() => props.test.weapon);
const system = computed(() => toRaw(weapon.value).systemData);

async function focusTarget(target: SR6Actor<BaseActorDataModel>): Promise<void> {
	if (target.token) {
		await canvas.animatePan(target.token.object.center);
		await canvas.ping(target.token.object.center);
	}
}

emit('setText', {
	title: `Roll Attack (${weapon.value.name})`,
	hint: `${system.value.description}`,
});
</script>

<template>
	<div class="roll-prompt">
		<div class="section warning-box" v-if="test.data.targetIds?.length == 0">
			<div class="section-title warning-title">Warning: No targets selected</div>
			You did not have any targets selected for this roll. Automatic damage, conditions and effects will not be
			applied.
		</div>
		<div class="section" style="width: 100%" v-else>
			<div class="section-title">Targets</div>

			<div class="target-box">
				<template v-for="target in props.test.targets" :key="target.id"
					><div @click.prevent="focusTarget(target)" @dblclick.prevent="target.sheet?.render(true)">
						{{ target.name }}
					</div></template
				>
			</div>
		</div>
		<div class="section" style="width: 76%">
			<div class="section-title"><Localized label="SR6.Labels.Information" /></div>
			<table>
				<tr>
					<td>
						<Localized label="SR6.Combat.Damage" />: {{ test.data.damage
						}}{{ system.damageData.damageType }}
					</td>
					<td><Localized label="SR6.Combat.AttackRating" />: {{ test.data.attackRating }}</td>
				</tr>
				<tr>
					<td></td>
					<td><Localized label="SR6.Combat.DefenseRating" />: {{ test.data.defenseRating }}</td>
				</tr>
			</table>
		</div>
	</div>
</template>

<style lang="scss" scoped>
@use '@/scss/vars/colors';

.roll-prompt {
	display: flex;
	flex-flow: wrap;

	.good {
		background-color: colors.$green-bg;
	}
	.bad {
		background-color: colors.$red-bg;
	}

	.target-box {
		//background-color: colors.$light-green;
		display: grid;

		grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));

		//gap: 1rem;

		div {
			text-align: center;
			background: colors.$light-red;
			padding: 0.5rem;
			border-radius: 1rem;

			&:hover {
				font-weight: bold;
				text-shadow: 0 0 5px #ff0000;
			}
		}
	}
}
</style>
