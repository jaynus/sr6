<script lang="ts" setup>
import { ActivationPhase } from '@/data';
import { IEdgeBoost } from '@/edge';
import { SpendEdgePostRollPromptContext } from '@/roll/SpendEdgePostRollPrompt';
import EdgeMenu from '@/edge/vue/EdgeMenu.vue';
import * as images from '@/vue/images';
import { RootContext } from '@/vue/SheetContext';
import { inject, ref, toRaw } from 'vue';

const context = inject<SpendEdgePostRollPromptContext>(RootContext)!;
const edgeBoost = ref<IEdgeBoost | null>(null);

async function roll() {
	context.resolvePromise(toRaw(edgeBoost.value));
}
</script>

<template>
	<div class="spend-edge-prompt">
		<div class="roll-numbers flexrow">
			<div class="edge-roll">
				<img
					:src="images.edge"
					style="
						border: 0;
						height: auto;
						width: 48px;
						z-index: 0;
						position: absolute;
						filter: drop-shadow(0 0 4px #000000);
					"
				/>
				<label name="pool" class="edge-value">{{ context.test.availableEdge }}</label>
			</div>
		</div>
		<Suspense>
			<EdgeMenu
				@setEdgeBoost="(boost) => (edgeBoost = boost as unknown as IEdgeBoost)"
				:test="context.test"
				:actor="context.actor"
				:phase="ActivationPhase.PostRoll"
			/>
		</Suspense>

		<div class="flexcol">
			<!-- Roll Button -->
			<div class="row">
				<button ref="finishRollButton" class="dialog-button finish-roll-button" @click.prevent="roll">
					Spend Edge
				</button>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
@use '@/scss/vars/colors';
@use '@/scss/sheets';

.spend-edge-prompt {
	min-width: 500px;
	min-height: 500px;

	.finish-roll-button {
		grid-column: 3 / span 1;
		grid-row: 4 / span 1;
		color: colors.$purple;
		font-family: var(--font-header);
		font-size: 1.25em;
	}

	.roll-numbers {
		white-space: nowrap;
		width: 125px;
	}

	.edge-roll {
		width: 48px;
		height: 48px;
		display: flex;
		flex-flow: column nowrap;
		justify-items: flex-start;
		position: relative;

		margin-right: 10px;
	}
	.edge-roll .edge-value {
		z-index: 1;
		position: relative;
		width: 48px;
		top: 10px;
		text-align: center;
		font-size: large;
		color: white;
		font-weight: bold;
	}
}
</style>
