<script lang="ts" setup>
import BaseActorDataModel from '@/actor/data/BaseActorDataModel';
import { computed, inject, ref, toRaw, onBeforeMount, onBeforeUpdate } from 'vue';

import { vLocalize } from '@/vue/directives';
import { ActorSheetContext, RootContext } from '@/vue/SheetContext';
import Localized from '@/vue/components/Localized.vue';
import Editor from '@/vue/components/Editor.vue';
import EffectsView from '@/vue/views/EffectsView.vue';
import SR6Effect from '@/effect/SR6Effect';

const props = withDefaults(
	defineProps<{
		/**
		 * Whether the actor has a decoration field to display.
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

const context = inject<ActorSheetContext<BaseActorDataModel>>(RootContext)!;
const system = computed(() => toRaw(context.data.actor).systemData);

// We have to:
//   1. Use an 'any' typing to skirt around TypeScript's complaints.
//   2. Keep a local ref that gets updated in onBeforeUpdate in order to work around some struggles with Foundry.
const effects = ref<SR6Effect[]>([]);

async function addEffect(category: string) {
	await toRaw(context.sheet.actor).createEmbeddedDocuments('ActiveEffect', [
		{
			label: context.data.actor.name,
			icon: 'icons/svg/aura.svg',
			disabled: category === 'suppressed',
			duration: category === 'temporary' ? { rounds: 1 } : undefined,
		},
	]);
}

function updateEffects(): void {
	componentKey.value += 1;
	effects.value = [...toRaw(context.data.actor).effects.map((e) => e as SR6Effect)];
}

onBeforeMount(updateEffects);
onBeforeUpdate(updateEffects);

const componentKey = ref(0);
</script>

<template>
	<div class="actor-sheet-basic">
		<header :class="props.hasDecoration ? 'with-decoration' : ''">
			<img
				:src="context.data.actor.img"
				data-edit="img"
				:title="context.data.actor.name"
				:alt="context.data.actor.name"
			/>
			<input
				type="text"
				name="name"
				:value="context.data.actor.name"
				v-localize:placeholder="'SR6.Labels.Name'"
			/>
			<!-- Decoration -->
			<slot v-if="props.hasDecoration" name="decoration"></slot>
		</header>

		<nav class="sheet-tabs" data-group="primary">
			<div class="spacer"></div>

			<slot name="tabs">
				<a class="actor" data-tab="description">
					<Localized label="SR6.Tabs.Description" />
				</a>

				<a class="actor" data-tab="data">
					<Localized label="SR6.Tabs.Data" />
				</a>

				<a v-if="props.showEffectsTab" class="actor" data-tab="effects">
					<Localized label="SR6.Tabs.Effects" />
				</a>
			</slot>

			<div class="spacer"></div>
		</nav>

		<section class="sheet-body">
			<div class="tab" data-group="primary" data-tab="description">
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
				<slot name="data" :key="componentKey"> DATA </slot>
			</div>

			<div v-if="props.showEffectsTab" class="tab" data-group="primary" data-tab="effects">
				<EffectsView :key="componentKey" :effects="[...(effects as any)]" @add-effect="addEffect" />
			</div>
		</section>
	</div>
</template>

<style lang="scss">
@use '@scss/mixins/reset.scss';
@use '@scss/vars/colors.scss';
@use '@scss/vars/sheet.scss';

.actor-sheet-basic {
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
		align-actors: center;

		padding: sheet.$padding;

		// Header Decoration
		&.with-decoration {
			grid-template-columns: auto 1fr auto;
		}

		// actor Image
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

			&:focus {
				font-family: 'Modesto Condensed', sans-serif;
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
			align-actors: center;
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
