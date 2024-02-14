<script lang="ts" setup>
import ContactDataModel from '@/item/data/feature/ContactDataModel';
import SR6Item from '@/item/SR6Item';
import BasicItemSheet from '@/vue/sheets/item/BasicItemSheet.vue';
import { computed, inject } from 'vue';

import { ItemSheetContext, RootContext } from '@/vue/SheetContext';

const context = inject<ItemSheetContext>(RootContext)!;
const system = computed(() => (context.data.item as SR6Item<ContactDataModel>).systemData);
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
					<label>Loyalty:</label
					><input type="number" data-dtype="Number" name="system.loyalty" :value="system.loyalty" />
				</div>
			</section>
		</template>
	</BasicItemSheet>
</template>

<style lang="scss">
@use '@scss/mixins/reset.scss';
@use '@scss/vars/colors.scss';
@use '@scss/vars/sheet.scss';
</style>
