<script lang="ts" setup>
import BaseActorDataModel from '@/actor/data/BaseActorDataModel';
import SR6Actor from '@/actor/SR6Actor';
import { FireMode, Target } from '@/data';
import { RangedAttackTest } from '@/test/RangedTests';

import Localized from '@/vue/components/Localized.vue';

import { computed, onMounted, toRaw } from 'vue';

const props = defineProps<{
	test: RangedAttackTest;
}>();

const emit = defineEmits<{
	(e: 'setText', value: { title: string; hint: string }): void;
	(e: 'setEdgeGainTarget', value: Target): void;
	(e: 'onChange'): void;
}>();

const weapon = computed(() => props.test.weapon);
const system = computed(() => toRaw(weapon.value).systemData);

const original_pool = props.test.data.pool!;

async function onChangeDistance() {
	props.test.data.attackRating = system.value.attackRatings.atDistance(props.test.data.distance!);
	emit('onChange');
}

async function onChangeFiremode() {
	switch (props.test.data.firemode) {
		case FireMode.SS: {
			props.test.data.attackRating = system.value.attackRatings.atDistance(props.test.data.distance!);
			props.test.data.damage = system.value.damage;
			props.test.data.pool = original_pool;
			break;
		}
		case FireMode.SA: {
			props.test.data.attackRating = system.value.attackRatings.atDistance(props.test.data.distance!) - 2;
			props.test.data.damage = system.value.damage + 1;
			props.test.data.pool = original_pool;
			break;
		}
		case FireMode.BF_narrow: {
			props.test.data.attackRating = system.value.attackRatings.atDistance(props.test.data.distance!) - 4;
			props.test.data.damage = system.value.damage + 2;
			props.test.data.pool = original_pool;
			break;
		}
		case FireMode.BF_wide: {
			props.test.data.attackRating = system.value.attackRatings.atDistance(props.test.data.distance!) - 2;
			props.test.data.damage = system.value.damage + 1;
			props.test.data.pool = Math.ceil(original_pool / 2);
			break;
		}
		case FireMode.FA: {
			props.test.data.attackRating = system.value.attackRatings.atDistance(props.test.data.distance!) - 6;
			props.test.data.damage = system.value.damage;
			props.test.data.pool = original_pool;
			break;
		}
	}
	emit('onChange');
}

async function focusTarget(target: SR6Actor<BaseActorDataModel>): Promise<void> {
	if (target.token) {
		await canvas.animatePan(target.token.object.center);
		await canvas.ping(target.token.object.center);
	}
}

function setEdgeGainTarget(): void {
	console.log('setEdgeGainTarget');

	if (props.test.data.attackRating! > props.test.data.defenseRating! + 4) {
		emit('setEdgeGainTarget', Target.Self);
	} else if (props.test.data.attackRating! + 4 < props.test.data.defenseRating!) {
		emit('setEdgeGainTarget', Target.Target);
	} else {
		emit('setEdgeGainTarget', Target.None);
	}
	emit('onChange');
}

onMounted(setEdgeGainTarget);

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
		<div class="section">
			<div class="section-title">
				<label><Localized label="SR6.Combat.Distance" /></label>
			</div>
			<select v-model="test.data.distance" @change.prevent="onChangeDistance">
				<option value="close"><Localized label="SR6.Combat.Distances.close" /></option>
				<option value="near"><Localized label="SR6.Combat.Distances.near" /></option>
				<option value="far"><Localized label="SR6.Combat.Distances.far" /></option>
				<option value="extreme"><Localized label="SR6.Combat.Distances.extreme" /></option>
			</select>
		</div>
		<div class="section">
			<div class="section-title">
				<label><Localized label="SR6.Combat.FireMode" /></label>
			</div>
			<select v-if="system.firemodes" v-model="test.data.firemode" @change.prevent="onChangeFiremode">
				<option value="SS"><Localized label="SR6.Combat.FireModes.SS.Name" /></option>
				<option value="SA"><Localized label="SR6.Combat.FireModes.SA.Name" /></option>
				<option value="BF_narrow"><Localized label="SR6.Combat.FireModes.BFNarrow.Name" /></option>
				<option value="BF_wide"><Localized label="SR6.Combat.FireModes.BFWide.Name" /></option>
				<option value="FA"><Localized label="SR6.Combat.FireModes.FA.Name" /></option>
			</select>
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
