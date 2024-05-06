<script lang="ts" setup>
import VehicleDataModel from '@/actor/data/VehicleDataModel';

import { computed, toRaw, inject } from 'vue';
import { ActorSheetContext, RootContext } from '@/vue/SheetContext';

const context = inject<ActorSheetContext<VehicleDataModel>>(RootContext)!;
const system = computed(() => toRaw(context.data.actor).systemData);
</script>

<template>
	<div class="vehicle-info">
		<div class="section-title">Information</div>
		<div>
			Max Acceleration:
			<input
				type="number"
				data-dtype="Number"
				name="system.stats.acceleration"
				:value="system.stats.acceleration"
			/>
			Max Speed:
			<input type="number" data-dtype="Number" name="system.stats.maxSpeed" :value="system.stats.maxSpeed" />
			Speed Interval:
			<input
				type="number"
				data-dtype="Number"
				name="system.stats.speedInterval"
				:value="system.stats.speedInterval"
			/>
		</div>
		<div></div>
		<div>
			Handling:
			<input
				type="number"
				data-dtype="Number"
				name="system.stats.handling.onRoad"
				:value="system.stats.handling.onRoad"
			/>
			/
			<input
				type="number"
				data-dtype="Number"
				name="system.stats.handling.offRoad"
				:value="system.stats.handling.offRoad"
			/>
		</div>
		<div>
			Body:
			<input type="number" data-dtype="Number" name="system.stats.handling.body" :value="system.stats.body" />
			Armor:
			<input type="number" data-dtype="Number" name="system.stats.armor" :value="system.stats.armor" />

			Pilot:
			<input type="number" data-dtype="Number" name="system.stats.pilot" :value="system.stats.pilot" />
			Sensor:
			<input type="number" data-dtype="Number" name="system.stats.sensor" :value="system.stats.sensor" />
		</div>
	</div>
</template>

<style lang="scss" scoped>
@use '@/scss/sheets';

.vehicle-info {
	@extend .section;
	min-width: 98%;
}
</style>
