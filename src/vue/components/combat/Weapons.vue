<script lang="ts" setup>
import CharacterDataModel from '@/actor/data/CharacterDataModel';
import SR6Actor from '@/actor/SR6Actor';
import WeaponDataModel from '@/item/data/gear/WeaponDataModel';
import SR6Item from '@/item/SR6Item';
import { toRaw, ref, watch } from 'vue';
import { Collapse } from 'vue-collapsed';

const props = defineProps<{
	actor: SR6Actor<CharacterDataModel>;
	weapons: WeaponDataModel[];
}>();

watch(props, () => {
	weaponsVisible.value = props.weapons.map((weapon) => {
		return {
			id: weapon.item!.id,
			visible: false,
		};
	});
});

const weaponsVisible = ref(
	props.weapons.map((weapon) => {
		return {
			id: weapon.item!.id,
			visible: false,
		};
	}),
);

function toggleWeaponVisible(weapon: WeaponDataModel) {
	const isVisible = weaponsVisible.value.find((v) => v.id === weapon.item!.id)!.visible;
	weaponsVisible.value.find((v) => v.id === weapon.item!.id)!.visible = !isVisible;
}

function toggleEquipWeapon(weapon: WeaponDataModel) {
	const equipped = toRaw(props.actor).systemData.equipped;
	if (equipped._weapon === weapon.item!.uuid) {
		equipped.weapon = null;
	} else {
		equipped.weapon = weapon.item! as unknown as SR6Item<WeaponDataModel>;
	}
}
</script>

<template>
	<div class="weapons-list">
		<div class="section-title">Weapons</div>
		<table>
			<template v-for="weapon in props.weapons" v-bind:key="weapon.item!.id">
				<tr>
					<td>
						<label class="switch">
							<input
								type="checkbox"
								:checked="
									actor.systemData.equipped.isEquipped(weapon.item! as SR6Item<WeaponDataModel>)
								"
								@change="toggleEquipWeapon(weapon)"
							/>
							<span class="slider round"></span>
						</label>
					</td>
					<td>
						<a @click="toggleWeaponVisible(weapon)"
							><i class="fa-solid fa-down-from-line"></i>&nbsp;&nbsp;{{ weapon.item!.name }}</a
						>
					</td>
				</tr>
				<Collapse :when="weaponsVisible.find((v) => v.id == weapon.item!.id)!.visible">
					<tr>
						<td colspan="2">Balls</td>
					</tr>
				</Collapse>
			</template>
		</table>
	</div>
</template>

<style lang="scss" scoped>
@use '@scss/vars/colors.scss';
@use '@scss/sheets.scss';

.weapons-list {
	@extend .section;
	width: 97%;

	.weapon-name {
	}
	.attack-button {
		text-align: right;
	}
}
</style>
