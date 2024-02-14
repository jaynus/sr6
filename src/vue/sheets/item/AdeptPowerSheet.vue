<script lang="ts" setup>
import { ActivationType } from '@/data';
import AdeptPowerDataModel from '@/item/data/feature/AdeptPowerDataModel';
import SR6Item from '@/item/SR6Item';
import { enumKeys } from '@/util';
import BasicItemSheet from '@/vue/sheets/item/BasicItemSheet.vue';
import { computed, inject } from 'vue';

import { ItemSheetContext, RootContext } from '@/vue/SheetContext';

const context = inject<ItemSheetContext>(RootContext)!;
const system = computed(() => (context.data.item as SR6Item<AdeptPowerDataModel>).systemData);
</script>

<template>
	<BasicItemSheet show-effects-tab>
		<template v-slot:data>
			<section class="data-grid">
				<div class="row">
					<label>Level:</label
					><input type="number" data-dtype="Number" name="system.level" :value="system.level" />
				</div>
				<div class="row">
					<label>Power Cost:</label
					><input type="number" data-dtype="Number" name="system.powerCost" :value="system.powerCost" />
				</div>
				<div class="row">
					<label>Activation Type:</label>
					><select name="system.activationType" :value="system.activation?.type">
						<option v-for="key in enumKeys(ActivationType)" v-bind:key="key" :value="ActivationType[key]">
							{{ key }}
						</option>
					</select>
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
