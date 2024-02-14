<script lang="ts" setup>
import SR6Actor from '@/actor/SR6Actor';
import BaseItemDataModel from '@/item/data/BaseItemDataModel';
import Localized from '@/vue/components/Localized.vue';
import SR6Item from '@/item/SR6Item';
import { createNewItem, deleteItem } from '@/vue/directives';
import { ref, watch } from 'vue';
import { Collapse } from 'vue-collapsed';

const props = withDefaults(
	defineProps<{
		actor: SR6Actor;
		items: SR6Item<BaseItemDataModel>[];
		type: string;
		title: string;
		width?: string;
		class?: string;
	}>(),
	{
		width: '100%',
		class: '',
	},
);

const expanded = ref(
	props.items.map((item) => {
		return {
			id: item.id,
			visible: false,
		};
	}),
);

watch(props, () => {
	expanded.value = props.items.map((item) => {
		return {
			id: item.id,
			visible: false,
		};
	});
});

function toggleExpanded(item: SR6Item) {
	const isExpanded = expanded.value.find((v) => v.id === item.id)!.visible;
	expanded.value.find((v) => v.id === item.id)!.visible = !isExpanded;
}
</script>

<template>
	<div :class="`item-list ${props.class}`">
		<div class="section-title">
			<h2 class="section-title"><Localized :label="props.title" /></h2>
			<a class="fas fa-plus" @click.prevent="createNewItem(props.actor, props.type)" />
		</div>
		<table>
			<template v-for="item in items" :key="item.id">
				<tr :title="item.systemData.description">
					<td class="name">
						<slot name="title" v-bind:item="item">
							<a @click.prevent="toggleExpanded(item)"
								><i class="fa-solid fa-down-from-line" /> {{ item.name }}</a
							>
						</slot>
					</td>
					<td>
						<slot name="customActions" v-bind:item="item"> </slot>
					</td>
					<td class="actions">
						<slot name="actions" v-bind:item="item">
							<a class="fas fa-edit" @click.prevent="item.sheet?.render(true)" /><a
								class="fas fa-trash"
								@click.prevent="deleteItem(item)"
							/>
						</slot>
					</td>
				</tr>
				<Collapse :when="expanded.find((v) => v.id == item.id)!.visible">
					<tr>
						<td colspan="2">
							<slot name="description" v-bind:item="item">{{ item.systemData.description }}</slot>
						</td>
					</tr>
				</Collapse>
			</template>
		</table>
	</div>
</template>

<style lang="scss" scoped>
@use '@scss/vars/colors.scss';
@use '@scss/sheets.scss';

.item-list {
	@extend .section;
	width: 97%;

	.name {
		width: 100%;
	}
}
</style>
