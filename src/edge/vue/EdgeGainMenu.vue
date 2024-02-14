<script lang="ts" setup>
import { ITest } from '@/test';
import { Target } from '@/data';
import { ref } from 'vue';

const props = defineProps<{
	test: ITest;
}>();

const edgeGainTarget = ref<Target>(Target.None);

function setEdgeGainTarget(newTarget: Target) {
	if (edgeGainTarget.value !== Target.None) {
		props.test.data.edge!.gain![edgeGainTarget.value] = Math.max(
			0,
			props.test.data.edge!.gain![edgeGainTarget.value] - 1,
		);
	}
	edgeGainTarget.value = newTarget;
	if (newTarget !== Target.None) {
		props.test.data.edge!.gain![newTarget] += 1;
	}
}

function reset() {
	edgeGainTarget.value = Target.None;
}

defineExpose({ reset, setEdgeGainTarget });
</script>

<template>
	<div class="edge-gain-menu">
		<div class="section-title">Edge Gain</div>
		<table>
			<tr>
				<td>
					<label class="switch">
						<input
							id="edgeGainNone"
							name="edgeGain"
							type="radio"
							:checked="edgeGainTarget === Target.None"
							@change.prevent="setEdgeGainTarget(Target.None)"
						/>
						<span class="slider round"></span>
					</label>
				</td>
				<td><label for="">None</label></td>
			</tr>
			<tr>
				<td>
					<label class="switch">
						<input
							id="edgeGainSelf"
							name="edgeGain"
							type="radio"
							:checked="edgeGainTarget === Target.Self"
							@change.prevent="setEdgeGainTarget(Target.Self)"
						/>
						<span class="slider round"></span>
					</label>
				</td>
				<td><label for="edgeGainSelf">Self</label></td>
			</tr>
			<tr>
				<td>
					<label class="switch">
						<input
							id="edgeGainTarget"
							name="edgeGain"
							type="radio"
							:checked="edgeGainTarget === Target.Target"
							@change.prevent="setEdgeGainTarget(Target.Target)"
							:disabled="!Object.prototype.hasOwnProperty.call(test.data, 'targetIds')"
						/>
						<span class="slider round"></span>
					</label>
				</td>
				<td><label for="edgeGainTarget">Target(s)</label></td>
			</tr>
		</table>
	</div>
</template>

<style lang="scss" scoped>
@use '@/scss/vars/colors';
@use '@/scss/sheets';

.edge-gain-menu {
	@extend .section;
}
</style>
