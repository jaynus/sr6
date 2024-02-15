<script lang="ts" setup>
import BaseActorDataModel from '@/actor/data/BaseActorDataModel';
import SR6Actor from '@/actor/SR6Actor';
import { ActivationPhase } from '@/data';
import { EdgeActionBoost, EdgeBoostType, IEdgeBoost } from '@/edge';
import EdgeActionDataModel from '@/item/data/action/EdgeActionDataModel';
import SR6Item from '@/item/SR6Item';
import { ITest } from '@/test';
import Localized from '@/vue/components/Localized.vue';
import { getEventValue } from '@/vue/directives';
import { ref, toRaw } from 'vue';
import { Collapse } from 'vue-collapsed';

const props = withDefaults(
	defineProps<{
		actor: SR6Actor<BaseActorDataModel>;
		test?: Maybe<ITest>;
		phase: ActivationPhase;
		show?: boolean;
	}>(),
	{
		phase: ActivationPhase.Any,
		show: true,
	},
);
const emit = defineEmits<{
	(e: 'setEdgeBoost', boost: null | IEdgeBoost): void;
}>();

const edgeBoost = ref<IEdgeBoost | null>(null);
const showMenu = ref(props.show);

// TODO: disabled for now, i need to hardcode these after all
const availableEdgeActions = ref<EdgeActionBoost[]>(
	toRaw(props.actor)
		.items.filter((i) => i.type === 'edge_action')
		.map((i) => i as SR6Item<EdgeActionDataModel>)
		.map(
			(i) =>
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				new (CONFIG.sr6.types.edge[EdgeBoostType.Action] as any)({
					edgeAction: i.uuid,
				}) as EdgeActionBoost,
		)
		.filter((boost) => boost.isApplicable(props.test)),
);

function getBoostsForPhase(phase: ActivationPhase): IEdgeBoost[] {
	return (
		Object.keys(CONFIG.sr6.types.edge)
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			.map((key) => new (CONFIG.sr6.types.edge[key] as any)())
			.filter((boost) => boost.phase === phase || boost.phase === ActivationPhase.Any)
	);
}

function onSelectEdgeBoost(ev: Event) {
	const key = getEventValue(ev) as string;
	if (key) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		edgeBoost.value = new (CONFIG.sr6.types.edge[key] as any)();
	} else {
		edgeBoost.value = null;
	}
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	emit('setEdgeBoost', edgeBoost.value as any);
}

async function onSelectEdgeAction(ev: Event) {
	const uuid = getEventValue(ev) as string;
	if (uuid) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const edgeAction = availableEdgeActions.value.find((action) => toRaw(action).edgeAction!.uuid === uuid);
		if (edgeAction) {
			edgeBoost.value = edgeAction;
		}
	} else {
		edgeBoost.value = null;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	emit('setEdgeBoost', edgeBoost.value as any);
}

function edgeAvailable(): number {
	if (props.test?.availableEdge) {
		return props.test?.availableEdge;
	}
	return props.actor.systemData.monitors.edge.value;
}
</script>

<template>
	<div class="edge-selection-menu">
		<div class="section-title">
			<a @click.prevent="showMenu = !showMenu">Spend Edge <i class="fa-solid fa-down-from-line"></i></a>
		</div>
		<Collapse class="edge-selection-content" :when="showMenu">
			<div>
				<label><Localized label="SR6.Edge.EdgeBoost" /></label>
				<select @change="onSelectEdgeBoost">
					<option value="null">-</option>
					<template v-for="boost in getBoostsForPhase(props.phase)" v-bind:key="boost.type">
						<option :value="boost.type" :title="boost.name" :disabled="boost.cost > edgeAvailable()">
							({{ boost.cost }}) <Localized :label="boost.name" />
						</option>
					</template>
				</select>
				<template v-if="phase === ActivationPhase.PreRoll">
					<label><Localized label="SR6.Edge.EdgeAction" /></label>
					<select @change="onSelectEdgeAction" :disabled="edgeBoost?.type !== EdgeBoostType.Action">
						<option>-</option>
						<option
							v-for="edgeActionBoost in availableEdgeActions"
							v-bind:key="edgeActionBoost.edgeAction?.uuid"
							:value="edgeActionBoost.edgeAction?.uuid"
						>
							({{ toRaw(edgeActionBoost.edgeAction)?.systemData.cost }})
							{{ edgeActionBoost.edgeAction?.name }}
						</option>
					</select>
				</template>
				<Collapse :when="edgeBoost != null" v-if="edgeBoost != null">
					<div class="edge-description">
						<div class="section-title"><Localized label="SR6.Labels.Description" /></div>
						<Localized class="formula" :label="edgeBoost.description" />
					</div>
				</Collapse>
				<label><Localized label="SR6.RollPrompt.ConsumeEdge" /></label>
				<label class="switch">
					<input type="checkbox" checked />
					<span class="slider round"></span>
				</label>
			</div>
		</Collapse>
	</div>
</template>

<style lang="scss" scoped>
@use '@/scss/vars/colors';
@use '@/scss/sheets';

.edge-selection-menu {
	@extend .section;
	min-width: 100%;

	.edge-selection-content {
		display: flex;
		flex-direction: row;
	}

	.edge-description {
		@extend .section;
		min-width: 97%;
	}
}
</style>
