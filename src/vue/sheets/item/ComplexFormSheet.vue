<script lang="ts" setup>
import ComplexFormDataModel from '@/item/data/ComplexFormDataModel';
import SR6Item from '@/item/SR6Item';
import BasicItemSheet from '@/vue/sheets/item/BasicItemSheet.vue';
import { computed, inject } from 'vue';

import { ItemSheetContext, RootContext } from '@/vue/SheetContext';

const context = inject<ItemSheetContext>(RootContext)!;
const _system = computed(() => (context.data.item as SR6Item<ComplexFormDataModel>).systemData);
</script>

<template>
	<BasicItemSheet show-effects-tab>
		<template v-slot:data> </template>
	</BasicItemSheet>
</template>

<style lang="scss">
@use '@scss/mixins/reset.scss';
@use '@scss/vars/colors.scss';
@use '@scss/vars/sheet.scss';
</style>
