<script lang="ts" setup>
import AugmentationDataModel from '@/item/data/feature/AugmentationDataModel';
import QualityDataModel from '@/item/data/feature/QualityDataModel';
import CredstickDataModel, { CredstickRating } from '@/item/data/gear/CredstickDataModel';
import SR6Item from '@/item/SR6Item';
import Localized from '@/vue/components/Localized.vue';
import SelectItem from '@/vue/components/SelectItem.vue';
import Switch from '@/vue/components/Switch.vue';
import ItemListView from '@/vue/views/ItemListView.vue';
import { computed, inject, toRaw } from 'vue';

import CharacterDataModel from '@/actor/data/CharacterDataModel';
import AttributesView from '@/vue/sheets/actor/character/AttributesView.vue';
import { ActorSheetContext, RootContext } from '@/vue/SheetContext';
import { createNewItem, deleteItem, updateItem } from '@/vue/directives';

const context = inject<ActorSheetContext<CharacterDataModel>>(RootContext)!;

const credsticks = computed(() =>
	toRaw(context.data.actor)
		.items.filter((i) => i.type === 'credstick')
		.map((i) => i as SR6Item<CredstickDataModel>),
);
const qualities = computed(() =>
	toRaw(context.data.actor)
		.items.filter((i) => i.type === 'quality')
		.map((i) => i as SR6Item<QualityDataModel>),
);
const augmentations = computed(() =>
	toRaw(context.data.actor)
		.items.filter((i) => i.type === 'augmentation')
		.map((i) => i as SR6Item<QualityDataModel>),
);
</script>

<template>
	<section class="tab-basics">
		<AttributesView />

		<div class="flexrow" style="width: 100%">
			<ItemListView title="Qualities" type="quality" :actor="context.data.actor" :items="qualities" />
			<div style="width: 40%">
				<div class="section" style="width: 100%">
					<div class="section-title">
						<h2 class="section-title"><Localized :label="`SR6.Items.Credstick.Plural`" /></h2>
						<a class="fas fa-plus" @click.prevent="createNewItem(context.data.actor, 'credstick')" />
					</div>
					<table>
						<thead>
							<tr>
								<td>Rating</td>
								<td>SIN</td>
								<td>Nuyen</td>
								<td></td>
							</tr>
						</thead>
						<tr v-for="item in credsticks" :key="item.id" :title="item.systemData.description">
							<td class="entry">
								<Localized
									:label="`SR6.Items.Credstick.Ratings.${CredstickRating[item.systemData.rating]}`"
								/>
							</td>
							<td class="entry">
								<SelectItem
									:actor="context.data.actor"
									type="sin"
									:selectedId="item.systemData.sin"
									@change="
										(newSin: Maybe<SR6Item>) => {
											updateItem(
												context.data.actor,
												item.id,
												'system.sin',
												newSin?.uuid as string,
											);
										}
									"
								/>
							</td>
							<td class="entry" style="white-space: nowrap">
								<input
									type="number"
									:value="item.systemData.nuyen"
									@change="(ev) => updateItem(context.data.actor, item.id, 'system.nuyen', ev)"
									style="width: 4em"
								/>
								/ {{ item.systemData.capacity }}
							</td>
							<td class="actions">
								<a class="fas fa-edit" @click.prevent="item.sheet?.render(true)" /><a
									class="fas fa-trash"
									@click.prevent="deleteItem(item)"
								/>
							</td>
						</tr>
					</table>
				</div>
				<ItemListView
					title="Augmentations"
					type="augmentation"
					:actor="context.data.actor"
					:items="augmentations"
				>
					<template v-slot:customActions="slotProps">
						<Switch
							v-if="(slotProps.item.systemData as AugmentationDataModel).activation"
							:checked="(slotProps.item.systemData as AugmentationDataModel).activation!.status"
							@change="(slotProps.item.systemData as AugmentationDataModel).toggleActive()"
					/></template>
				</ItemListView>
			</div>
		</div>
	</section>
</template>

<style lang="scss" scoped>
@use '@scss/vars/colors.scss';

.tab-basics {
	display: flex;
	flex-direction: column;
	flex-wrap: nowrap;
	gap: 0.5em;
	padding: 0.5em;
}
</style>
