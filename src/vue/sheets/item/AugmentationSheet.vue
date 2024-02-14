<script lang="ts" setup>
import AugmentationDataModel from '@/item/data/feature/AugmentationDataModel';
import { GearAvailabilityDataModel } from '@/item/data/gear/GearDataModel';
import SR6Item from '@/item/SR6Item';
import { getItem } from '@/util';
import GearAvailability from '@/vue/components/GearAvailability.vue';
import BasicItemSheet from '@/vue/sheets/item/BasicItemSheet.vue';
import { computed, inject } from 'vue';
import { computedAsync } from '@vueuse/core';

import { ItemSheetContext, RootContext } from '@/vue/SheetContext';

const context = inject<ItemSheetContext>(RootContext)!;
const system = computed(() => (context.data.item as SR6Item<AugmentationDataModel>).systemData);

const sourceGear = computedAsync(async () => {
	const items: SR6Item[] = [];
	for (const uuid of system.value.sourceGearIds) {
		const item = await getItem(SR6Item, uuid);

		if (item) {
			items.push(item!);
		}
	}

	return items;
});
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
					<label>Quality:</label
					><input type="number" data-dtype="Number" name="system.quality" :value="system.quality" />
				</div>
				<div class="row">
					<label>Cost Formula:</label
					><input type="text" name="system.costFormula" :value="system.costFormula" />
				</div>
				<div class="row">
					<label>Essence Cost Formula:</label
					><input type="text" name="system.essenceCostFormula" :value="system.essenceCostFormula" />
				</div>
				<div class="row">
					<GearAvailability
						:avail="system.availability"
						@change="(ev: GearAvailabilityDataModel) => (system.availability = ev)"
					/>
				</div>
				<div class="row">
					<label>Gear Added:</label>
					<table>
						<tr v-for="item in sourceGear" v-bind:key="item.uuid">
							<td class="item-image">
								<img :src="item.img" :title="item.name" :alt="item.name" width="32px" height="32px" />
							</td>
							<td class="item-name">{{ item.name }}</td>
						</tr>
					</table>
				</div>
			</section>
		</template>
	</BasicItemSheet>
</template>

<style lang="scss">
@use '@scss/mixins/reset.scss';
@use '@scss/vars/colors.scss';
@use '@scss/vars/sheet.scss';

.item-image {
	width: 32px;
}
.item-name {
	text-align: left;
}
</style>
