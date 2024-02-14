<script lang="ts" setup>
import SINDataModel from '@/item/data/feature/SINDataModel';
import SR6Item from '@/item/SR6Item';
import BasicItemSheet from '@/vue/sheets/item/BasicItemSheet.vue';
import { computed, inject } from 'vue';

import { ItemSheetContext, RootContext } from '@/vue/SheetContext';

const context = inject<ItemSheetContext>(RootContext)!;
const system = computed(() => (context.data.item as SR6Item<SINDataModel>).systemData);
</script>

<template>
	<BasicItemSheet show-effects-tab>
		<template v-slot:data>
			<section class="data-grid">
				<div class="row">
					<label>Rating:</label
					><input type="number" data-dtype="Number" name="system.rating" :value="system.rating" />
				</div>
				<div class="row">
					<label>Cost Formula:</label><input type="text" name="system.rating" :value="system.costFormula" />
				</div></section
		></template>
	</BasicItemSheet>
</template>

<style lang="scss">
@use '@scss/mixins/reset.scss';
@use '@scss/vars/colors.scss';
@use '@scss/vars/sheet.scss';
</style>
