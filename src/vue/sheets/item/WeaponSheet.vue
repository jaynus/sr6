<script lang="ts" setup>
import SR6ActiveEffect from '@/effect/SR6ActiveEffect';
import GearDataModel, { GearType } from '@/item/data/gear/GearDataModel';
import WeaponDataModel from '@/item/data/gear/WeaponDataModel';
import SR6Item from '@/item/SR6Item';
import { getItem } from '@/util';
import Editor from '@/vue/components/Editor.vue';
import Localized from '@/vue/components/Localized.vue';

import { vLocalize } from '@/vue/directives';
import { ItemSheetContext, RootContext } from '@/vue/SheetContext';
import EffectsView from '@/vue/views/EffectsView.vue';
import { computed, inject, onBeforeMount, onBeforeUpdate, ref, toRaw } from 'vue';

const props = withDefaults(
	defineProps<{
		/**
		 * Whether the item has a decoration field to display.
		 */
		hasDecoration?: boolean;

		/**
		 * Whether to show or hide the ActiveEffects tab
		 * Whether to show or hide the ActiveEffects tab
		 */
		showEffectsTab?: boolean;
	}>(),
	{ hasDecoration: false, showEffectsTab: true },
);

const context = inject<ItemSheetContext>(RootContext)!;
const system = computed(() => context.data.item.systemData as WeaponDataModel);

// We have to:
//   1. Use an 'any' typing to skirt around TypeScript's complaints.
//   2. Keep a local ref that gets updated in onBeforeUpdate in order to work around some struggles with Foundry.
const effects = ref<SR6ActiveEffect[]>([]);

async function addEffect(category: string) {
	await toRaw(context.sheet.item).createEmbeddedDocuments('ActiveEffect', [
		{
			label: context.data.item.name,
			icon: 'icons/svg/aura.svg',
			disabled: category === 'suppressed',
			duration: category === 'temporary' ? { rounds: 1 } : undefined,
		},
	]);
}

function updateEffects() {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	effects.value = [...(toRaw(context.data.item).effects as any)];
}

onBeforeMount(updateEffects);
onBeforeUpdate(updateEffects);

async function _getDropAccessory(ev: DragEvent): Promise<Maybe<SR6Item<GearDataModel>>> {
	const dropJson = ev.dataTransfer?.getData('text/plain') ?? null;
	if (!dropJson) {
		return null;
	}
	const DragEventData: DragEventData = JSON.parse(dropJson);

	if (DragEventData.type !== 'Item') {
		return null;
	}
	const item: Maybe<SR6Item<GearDataModel>> = await getItem(SR6Item<GearDataModel>, DragEventData.uuid as ItemUUID);
	if (!item) {
		return null;
	}

	if (item.type !== 'gear' || item.systemData.category.type !== GearType.Accessory) {
		ui.notifications.warn('Only weapon attachments can be attached to a weapon');
	}

	return item;
}

async function onDrop(ev: DragEvent) {
	const item = await _getDropAccessory(ev);
	if (!item) {
		return;
	}

	const res = await toRaw(system.value).attachAccessory(item);
	if (!res.ok) {
		ui.notifications.error(`Failed to link accessory: ${res.val}`);
	}
}

async function detachAccessory(accessory: SR6Item<GearDataModel>) {
	await toRaw(system.value).detachAccessory(toRaw(accessory));
}
</script>

<template>
	<div class="weapon-sheet" @drop="onDrop">
		<header :class="props.hasDecoration ? 'with-decoration' : ''">
			<img
				:src="context.data.item.img"
				data-edit="img"
				:title="context.data.item.name"
				:alt="context.data.item.name"
			/>
			<input type="text" name="name" :value="context.data.item.name" v-localize:placeholder="'SR6.Labels.Name'" />
			<!-- Decoration -->
			<slot v-if="props.hasDecoration" name="decoration"></slot>
		</header>

		<nav class="sheet-tabs" data-group="primary">
			<div class="spacer"></div>

			<slot name="tabs">
				<a class="item" data-tab="basics">
					<Localized label="SR6.Tabs.Basics" />
				</a>

				<a v-if="showEffectsTab" class="item" data-tab="effects">
					<Localized label="SR6.Tabs.Effects" />
				</a>
			</slot>

			<div class="spacer"></div>
		</nav>

		<section class="sheet-body">
			<div class="tab" data-group="primary" data-tab="basics">
				<div class="section">
					<div class="section-title">Attack Details</div>
					<div>Attack Rating:</div>
					<div>Damage:</div>
				</div>
				<div class="accessories">
					<div class="section-title">Accessories</div>
					<table>
						<tr v-for="accessory in system.accessories" v-bind:key="accessory.id">
							{{
								accessory.name
							}}
							<td></td>
							<td>
								<a @click="detachAccessory(accessory)"><i class="fas fa-link-slash" /></a>
							</td>
						</tr>
					</table>
				</div>
				<div class="section">
					<div class="section-title">Details</div>
					<div class="section-title"><Localized label="SR6.Labels.Source" /></div>
					<input type="text" name="system.source" :value="system.source" style="width: 10em" />

					<div class="section-title"><Localized label="SR6.Labels.Description" /></div>
					<Editor name="system.description" :content="system.description" button />
				</div>
			</div>

			<div v-if="props.showEffectsTab" class="tab" data-group="primary" data-tab="effects">
				<EffectsView :effects="[...(effects as any)]" @add-effect="addEffect" />
			</div>
		</section>
	</div>
</template>

<style lang="scss">
@use '@scss/mixins/reset';
@use '@scss/vars/colors';
@use '@scss/sheets';

.weapon-sheet {
	.accessories {
		@extend .section;
		width: 30%;
	}

	header {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.5rem;
		align-items: center;

		// Header Decoration
		&.with-decoration {
			grid-template-columns: auto 1fr auto;
		}

		// Item Image
		img {
			border: 1px solid colors.$gold;
			background: transparentize(colors.$gold, 0.5);
			border-radius: 1em;
			height: 2.5rem;
		}

		// Name Input
		@include reset.input;
		input {
			width: 100%;
			font-family: var(--font-header);
			font-size: 2rem;
			color: colors.$blue;

			&,
			&:focus {
				border-bottom: 1px solid colors.$dark-blue;
			}
		}
	}
}
</style>
