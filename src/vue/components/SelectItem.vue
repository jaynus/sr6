<script setup lang="ts">
import SR6Actor from '@/actor/SR6Actor';
import SINDataModel from '@/item/data/feature/SINDataModel';
import SR6Item from '@/item/SR6Item';
import { getEventValue } from '@/vue/directives';
import { toRaw, computed, ref } from 'vue';

const props = defineProps<{
	actor?: SR6Actor;
	type?: string;
	options?: SR6Item<SINDataModel>[];
	selected?: SR6Item<SINDataModel> | null;
	selectedId?: ItemUUID | null;
}>();

const emit = defineEmits<{
	(e: 'change', value: Maybe<SR6Item>): void;
}>();

const items = computed<SR6Item[]>(() => {
	if (props.options) {
		return props.options;
	} else if (props.actor) {
		return toRaw(props.actor)
			.items.map((i) => i as SR6Item)
			.filter((i) => (props.type ? i.type === props.type : true));
	} else {
		return game.items.map((i) => i as SR6Item);
	}
});

const selectedId = ref(props.selected?.uuid || props.selectedId);
</script>

<template>
	<select
		@change="
			(ev) =>
				emit(
					'change',
					items.find((sin) => sin.uuid === (getEventValue(ev) as string)),
				)
		"
	>
		<option value="">-</option>
		<option v-for="item in items" :key="item.uuid" :value="item.uuid" :selected="selectedId === item.uuid">
			{{ item.name }}
		</option>
	</select>
</template>

<style lang="scss" scoped></style>
