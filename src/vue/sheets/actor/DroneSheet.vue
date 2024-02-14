<script lang="ts" setup>
import DroneDataModel from '@/actor/data/DroneDataModel';
import { computed, toRaw, inject } from 'vue';
import { ActorSheetContext, RootContext } from '@/vue/SheetContext';
import BasicActorSheet from '@/vue/sheets/actor/BasicActorSheet.vue';

const context = inject<ActorSheetContext<DroneDataModel>>(RootContext)!;
const _system = computed(() => toRaw(context.data.actor).systemData);
</script>

<template>
	<BasicActorSheet show-effects-tab>
		<template v-slot:data> </template>
	</BasicActorSheet>
</template>

<style lang="scss" scoped>
.drone-sheet {
	width: 100%;
	height: 100%;

	display: grid;
	// Meta, Combat Stats, Tabs, tab content
	grid-template-rows: repeat(3, auto) 1fr;
	gap: 0.5em;
}
</style>
