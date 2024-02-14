<script lang="ts" setup>
import CredstickDataModel, { CredstickRating } from '@/item/data/gear/CredstickDataModel';
import SR6Item from '@/item/SR6Item';
import { enumKeys, isAlpha } from '@/util';
import BasicItemSheet from '@/vue/sheets/item/BasicItemSheet.vue';
import { computed, inject } from 'vue';

import { ItemSheetContext, RootContext } from '@/vue/SheetContext';

const context = inject<ItemSheetContext>(RootContext)!;
const system = computed(() => (context.data.item as SR6Item<CredstickDataModel>).systemData);
</script>

<template>
	<BasicItemSheet show-effects-tab>
		<template v-slot:data>
			<section class="data-grid">
				<div class="row">
					<label>Rating:</label
					><select data-dtype="Number" name="system.rating">
						<option
							v-for="key of enumKeys(CredstickRating).filter((k) => isAlpha(k))"
							v-bind:key="key"
							:value="CredstickRating[key]"
						>
							{{ key }}
						</option>
					</select>
				</div>
				<div class="row"><label>Capacity:</label>{{ system.capacity }}</div>
				<div class="row">
					<label>Current Balance:</label
					><input type="number" data-dtype="Number" name="system.nuyen" :value="system.nuyen" />
				</div>
				<div class="row"><label>Linked SIN:</label>TODO:</div>
			</section>
		</template>
	</BasicItemSheet>
</template>

<style lang="scss">
@use '@scss/mixins/reset.scss';
@use '@scss/vars/colors.scss';
@use '@scss/vars/sheet.scss';
</style>
