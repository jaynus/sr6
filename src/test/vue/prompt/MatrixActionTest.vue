/* eslint-disable vue/multi-word-component-names */
<script lang="ts" setup>
import { MatrixActionTest } from '@/test/MatrixTests';
import Localized from '@/vue/components/Localized.vue';
import { ref } from 'vue';

const props = defineProps<{
	test: MatrixActionTest;
}>();

const emit = defineEmits<{
	(e: 'setText', value: { title: string; hint: string }): void;
}>();

const actionName = ref(props.test.matrixAction.name);
const actionDescription = ref(props.test.matrixAction.systemData.description);

emit('setText', {
	title: `Matrix Action (${actionName.value})`,
	hint: ``,
});
</script>

<template>
	<div class="matrix-action-test-prompt">
		<div class="section">
			<div class="section-title">Description</div>
			{{ actionDescription }}
		</div>
		<div class="section" style="width: 76%">
			<div class="section-title"><Localized label="SR6.Labels.Information" /></div>
			<table>
				<tr>
					<td>
						<template v-if="test.matrixAction.systemData.formulas.damage">
							<Localized label="SR6.Combat.Damage" /> Formula:
							{{ test.matrixAction.systemData.formulas.damage }}
						</template>
					</td>
					<td>Base <Localized label="SR6.Combat.Damage" />: {{ test.data.damage }}</td>
				</tr>
				<tr>
					<td><Localized label="SR6.Combat.AttackRating" />: {{ test.data.attackRating }}</td>
					<td><Localized label="SR6.Combat.DefenseRating" />: TODO</td>
				</tr>
			</table>
		</div>
		<div class="section">
			<div class="section-title">Edge Gain</div>
			<table>
				<tr>
					<td>
						<label class="switch">
							<input id="edgeGainNone" name="edgeGain" type="radio" />
							<span class="slider round"></span>
						</label>
					</td>
					<td><label for="">None</label></td>
				</tr>
				<tr>
					<td>
						<label class="switch">
							<input id="edgeGainSelf" name="edgeGain" type="radio" />
							<span class="slider round"></span>
						</label>
					</td>
					<td><label for="edgeGainSelf">Self</label></td>
				</tr>
				<tr>
					<td>
						<label class="switch">
							<input id="edgeGainTarget" name="edgeGain" type="radio" />
							<span class="slider round"></span>
						</label>
					</td>
					<td><label for="edgeGainTarget">Target(s)</label></td>
				</tr>
			</table>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.matrix-action-test-prompt {
	display: flex;
	flex-flow: wrap;
}
</style>
