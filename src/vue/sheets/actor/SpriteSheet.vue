<script lang="ts" setup>
import SpriteDataModel from '@/actor/data/SpriteDataModel';
import { computed, toRaw, inject } from 'vue';
import { ActorSheetContext, RootContext } from '@/vue/SheetContext';
import BasicActorSheet from '@/vue/sheets/actor/BasicActorSheet.vue';

const context = inject<ActorSheetContext<SpriteDataModel>>(RootContext)!;
const _system = computed(() => toRaw(context.data.actor).systemData);
</script>

<template>
	<BasicActorSheet show-effects-tab>
		<template v-slot:data> </template>
	</BasicActorSheet>
</template>

<style lang="scss" scoped>
.sprite-sheet {
	width: 100%;
	height: 100%;

	display: grid;
	// Meta, Combat Stats, Tabs, tab content
	grid-template-rows: repeat(3, auto) 1fr;
	gap: 0.5em;
}
</style>
