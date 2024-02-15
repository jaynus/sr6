<script lang="ts" setup>
import GearDataModel, { GearSize, GearType } from '@/item/data/gear/GearDataModel';
import SR6Item from '@/item/SR6Item';
import { computed, inject, toRaw } from 'vue';

import { vLocalize } from '@/vue/directives';
import { ItemSheetContext, RootContext } from '@/vue/SheetContext';
import Localized from '@/vue/components/Localized.vue';
import Editor from '@/vue/components/Editor.vue';
import EffectsView from '@/vue/views/EffectsView.vue';
import SR6ActiveEffect from '@/effect/SR6ActiveEffect';

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
const system = computed(() => (context.data.item as SR6Item<GearDataModel>).systemData);

// We have to:
//   1. Use an 'any' typing to skirt around TypeScript's complaints.
//   2. Keep a local ref that gets updated in onBeforeUpdate in order to work around some struggles with Foundry.
const effects = computed<SR6ActiveEffect[]>(() => [
	...(Array.from(toRaw(context.data.item).effects) as SR6ActiveEffect[]),
]);

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
</script>

<template>
	<div class="item-sheet-basic">
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
				<a class="item" data-tab="description">
					<Localized label="SR6.Tabs.Description" />
				</a>

				<a class="item" data-tab="data">
					<Localized label="SR6.Tabs.Data" />
				</a>

				<a v-if="showEffectsTab" class="item" data-tab="effects">
					<Localized label="SR6.Tabs.Effects" />
				</a>
			</slot>

			<div class="spacer"></div>
		</nav>

		<section class="sheet-body">
			<div class="tab" data-group="primary" data-tab="description">
				<slot name="rating">
					<label><Localized label="SR6.Labels.Rating" /></label>
					<input type="text" name="system.rating" :value="system.rating" />
				</slot>
				<slot name="category">
					<label><Localized label="SR6.Labels.Category" /></label>
					<select name="system.category.type" :value="system.category.type">
						<option
							v-for="type in Object.keys(GearType)"
							v-bind:key="type"
							:value="GearType[type as keyof typeof GearType]"
						>
							<Localized :label="`SR6.Gear.Types.${type}`" />
						</option>
					</select>
					<label><Localized label="SR6.Labels.SubCategory" /></label>
					<input type="text" name="system.category.subtype" :value="system.category.subtype" />
				</slot>
				<slot name="size">
					<label><Localized label="SR6.Labels.Size" /></label>
					<select name="system.size" :value="system.size">
						<option
							v-for="size in Object.keys(GearSize)"
							v-bind:key="size"
							:value="GearSize[size as keyof typeof GearSize]"
						>
							<Localized :label="`SR6.Gear.Sizes.${size}`" />
						</option>
					</select>
				</slot>
				<slot name="source">
					<label><Localized label="SR6.Labels.Source" /></label>
					<input type="text" name="system.source" :value="system.source" />
				</slot>
				<slot name="description">
					<label><Localized label="SR6.Labels.Description" /></label>
					<Editor name="system.description" :content="system.description" button />
				</slot>
			</div>

			<div class="tab" data-group="primary" data-tab="data">
				<slot name="data"> DATA </slot>
			</div>

			<div v-if="props.showEffectsTab" class="tab" data-group="primary" data-tab="effects">
				<EffectsView :effects="[...(effects as any)]" @add-effect="addEffect" />
			</div>
		</section>
	</div>
</template>

<style lang="scss">
@use '@scss/mixins/reset.scss';
@use '@scss/vars/colors.scss';
@use '@scss/vars/sheet.scss';

.item-sheet-basic {
	width: calc(100% + #{sheet.$padding * 2});
	height: calc(100% + #{sheet.$padding * 2});

	display: grid;
	grid-template-rows: /* Header & Tabs */ repeat(2, auto) /* Tab Content */ 1fr;

	margin: -1 * sheet.$padding;

	.editor-content {
		font-family: var(--font-primary);
		text-align: justify;
	}

	header {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.5rem;
		align-items: center;

		padding: sheet.$padding;

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

	nav.sheet-tabs {
		margin-left: 0;
		width: 100%;
	}

	.tab {
		padding-left: sheet.$padding;
		padding-right: sheet.$padding;
	}

	section.data-grid {
		display: flex;
		flex-direction: column;

		.row {
			display: grid;
			grid-template-columns: minmax(min-content, 30%) 1fr;
			align-items: center;
			border-bottom: 1px dashed black;
			padding: 0.25em;
			row-gap: 0.1em;

			input:not([type='checkbox']),
			select {
				width: 100%;
			}

			input[type='checkbox'] {
				justify-self: right;
			}

			& > * {
				grid-column: 2 / span 1;
			}

			& > label {
				grid-column: 1 / span 1;
			}
		}
	}
}
</style>
