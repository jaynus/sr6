<script lang="ts" setup>
import { MonitorDataModel } from '@/actor/data/MonitorsDataModel';

const emit = defineEmits<{
	(e: 'setDamage', value: number): void;
}>();

const props = withDefaults(
	defineProps<{
		monitor: MonitorDataModel;
		icon?: string;
		showModifiers?: boolean;
	}>(),
	{
		icon: '/systems/sr6/assets/heart.webp',
		showModifiers: true,
	},
);

function setDamage(amount: number) {
	if (props.monitor.damage === amount) {
		emit('setDamage', 0);
	} else {
		emit('setDamage', amount);
	}
}

function boxStyle(idx: number) {
	if (idx <= props.monitor.damage) {
		return 'width: 32px; background: var(--monitor-damaged)';
	} else {
		return 'width: 32px';
	}
}
</script>

<template>
	<div style="width: 100%" class="monitor-view">
		<table>
			<tr>
				<td class="monitor-header" :style="`background-image: url(${props.icon})`"></td>
				<td
					class="monitor-bar-box"
					:style="boxStyle(idx)"
					v-for="idx in props.monitor.max"
					:key="idx"
					@click.prevent="setDamage(idx)"
				>
					<template v-if="props.showModifiers && idx % 3 == 0">
						{{ -Math.round((idx + 1) / 3) }}
					</template>
				</td>
			</tr>
		</table>
	</div>
</template>

<style lang="scss" scoped>
.monitor-view {
	.monitor-header {
		font-weight: bold;
		width: 32px;
		height: 24px;
		background-repeat: no-repeat;
		background-size: 24px;
		background-color: var(--monitor-background);
		border-right: solid var(--section-border) 1px;
	}
	.monitor-bar-box {
		text-align: center;
		font-size: 12px;
		border-left: solid var(--section-border) 1px;
		background-color: var(--monitor-background);
	}
}
</style>
