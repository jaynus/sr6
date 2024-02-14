<script lang="ts" setup>
import BaseActorDataModel from '@/actor/data/BaseActorDataModel';
import SR6Actor from '@/actor/SR6Actor';
import { ActivationPhase } from '@/data';
import { IEdgeBoost } from '@/edge';
import { InitiativeRollPromptContext } from '@/roll/InitiativeRollPrompt';
import EdgeMenu from '@/edge/vue/EdgeMenu.vue';
import Localized from '@/vue/components/Localized.vue';
import { RootContext } from '@/vue/SheetContext';
import { inject, ref, toRaw } from 'vue';

const context = inject<InitiativeRollPromptContext>(RootContext)!;
const edgeBoost = ref<IEdgeBoost | null>(null);

async function roll() {
	// Apply the boost to the data
	await edgeBoost.value?.prepareInitiative?.(toRaw(context.data));
	context.resolvePromise(toRaw(context.data));
}
</script>

<template>
	<EdgeMenu
		@setEdgeBoost="(boost) => (edgeBoost = boost as unknown as IEdgeBoost)"
		:test="context.test"
		:actor="context.actor as unknown as SR6Actor<BaseActorDataModel>"
		:phase="ActivationPhase.Initiative"
	/>

	<div class="flexcol">
		<!-- Roll Button -->
		<div class="row">
			<button ref="finishRollButton" class="dialog-button finish-roll-button" @click.prevent="roll">
				<Localized label="SR6.Labels.Roll" />
			</button>
		</div>
	</div>
</template>

<style lang="scss" scoped>
@use '@/scss/vars/colors';
@use '@/scss/sheets';

.app-roll-prompt {
	min-width: 500px;
	min-height: 500px;

	.finish-roll-button {
		grid-column: 3 / span 1;
		grid-row: 4 / span 1;
		color: colors.$purple;
		font-family: var(--font-header);
		font-size: 1.25em;
	}
}
</style>
