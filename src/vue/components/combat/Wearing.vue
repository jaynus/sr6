<script lang="ts" setup>
import CharacterDataModel from '@/actor/data/CharacterDataModel';
import SR6Actor from '@/actor/SR6Actor';
import WearableDataModel, { WearableSlot } from '@/item/data/gear/WearableDataModel';
import SR6Item from '@/item/SR6Item';
import { ref, toRaw, watch } from 'vue';
import { Collapse } from 'vue-collapsed';

const props = defineProps<{
	actor: SR6Actor<CharacterDataModel>;
	wearables: WearableDataModel[];
}>();

watch(props, () => {
	wearablesVisible.value = props.wearables.map((wearable) => {
		return {
			id: wearable.item!.id,
			visible: false,
		};
	});
});

const wearablesVisible = ref(
	props.wearables.map((wearable) => {
		return {
			id: wearable.item!.id,
			visible: false,
		};
	}),
);

const defenseRating = ref(toRaw(props.actor).systemData.defenseRating(null));

function toggleWearableVisible(wearable: WearableDataModel) {
	const isVisible = wearablesVisible.value.find((v) => v.id === wearable.item!.id)!.visible;
	wearablesVisible.value.find((v) => v.id === wearable.item!.id)!.visible = !isVisible;
}

function toggleEquipWearable(wearable: WearableDataModel) {
	switch (wearable.slots[0]) {
		case WearableSlot.Armor: {
			const equipped = toRaw(props.actor).systemData.equipped;
			if (equipped._armor === wearable.item!.uuid) {
				equipped.armor = null;
			} else {
				equipped.armor = wearable.item! as unknown as SR6Item<WearableDataModel>;
			}
			break;
		}
		case WearableSlot.Head: {
			const equipped = toRaw(props.actor).systemData.equipped;
			if (equipped._head === wearable.item!.uuid) {
				equipped.head = null;
			} else {
				equipped.head = wearable.item! as unknown as SR6Item<WearableDataModel>;
			}
			break;
		}
		case WearableSlot.Clothes: {
			const equipped = toRaw(props.actor).systemData.equipped;
			if (equipped._clothes === wearable.item!.uuid) {
				equipped.clothes = null;
			} else {
				equipped.clothes = wearable.item! as unknown as SR6Item<WearableDataModel>;
			}
			break;
		}
	}
	defenseRating.value = toRaw(props.actor).systemData.defenseRating(null);
}
</script>

<template>
	<div class="wearables-list">
		<div class="section-title">Wearable</div>
		Defense Rating: {{ defenseRating }}
		<table>
			<template v-for="wearable in props.wearables" v-bind:key="wearable.item!.id">
				<tr>
					<td>
						<label class="switch">
							<input
								type="checkbox"
								:checked="
									actor.systemData.equipped.isEquipped(wearable.item! as SR6Item<WearableDataModel>)
								"
								@change="toggleEquipWearable(wearable)"
							/>
							<span class="slider round"></span>
						</label>
					</td>
					<td>
						<a @click="toggleWearableVisible(wearable)"
							><i class="fa-solid fa-down-from-line"></i>&nbsp;&nbsp;{{ wearable.item!.name }}</a
						>
					</td>
				</tr>
				<Collapse :when="wearablesVisible.find((v) => v.id == wearable.item!.id)!.visible">
					<tr>
						<td colspan="2">Balls</td>
					</tr>
				</Collapse>
			</template>
		</table>
	</div>
</template>

<style lang="scss" scoped>
@use '@/scss/vars/colors';
@use '@/scss/sheets';

.wearables-list {
	@extend .section;
	width: 97%;

	.wearable-name {
	}
	.attack-button {
		text-align: right;
	}
}
</style>
