<script lang="ts" setup>
import EdgeActionDataModel from '@/item/data/action/EdgeActionDataModel';
import SR6Item from '@/item/SR6Item';
import BasicItemSheet from '@/vue/sheets/item/BasicItemSheet.vue';
import { computed, inject } from 'vue';

import { ItemSheetContext, RootContext } from '@/vue/SheetContext';

const context = inject<ItemSheetContext>(RootContext)!;
const system = computed(() => (context.data.item as SR6Item<EdgeActionDataModel>).systemData);
</script>

<template>
	<BasicItemSheet show-effects-tab>
		<template v-slot:data>
			<div class="script-section">
				<div class="section-title">prepareActor</div>
				<textarea name="system.scripts.prepareActor" v-model="system.scripts.prepareActor"></textarea>
			</div>
			<div class="script-section">
				<div class="section-title">prepareTest</div>
				<textarea name="system.scripts.prepareTest" v-model="system.scripts.prepareTest"></textarea>
			</div>
			<div class="script-section">
				<div class="section-title">finishTest</div>
				<textarea name="system.scripts.finishTest" v-model="system.scripts.finishTest"></textarea>
			</div>
			<div class="script-section">
				<div class="section-title">prepareInitiative</div>
				<textarea name="system.scripts.prepareInitiative" v-model="system.scripts.prepareInitiative"></textarea>
			</div>
			<div class="script-section">
				<div class="section-title">finishRoll</div>
				<textarea name="system.scripts.finishRoll" v-model="system.scripts.finishRoll"></textarea>
			</div>
		</template>
	</BasicItemSheet>
</template>

<style lang="scss">
@use '@scss/mixins/reset';
@use '@scss/vars/colors';
@use '@scss/sheets';

.script-seciton {
	@extend .section;
	width: 100%;
}
</style>
