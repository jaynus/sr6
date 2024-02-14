<script lang="ts" setup>
import { AdjustableMatrixAttributesDataModel } from '@/data/MatrixAttributesDataModel';
import MatrixICDataModel from '@/item/data/MatrixICDataModel';
import SR6Item from '@/item/SR6Item';
import { MatrixActionTest } from '@/test/MatrixTests';
import MatrixAttributesView from '@/vue/views/MatrixAttributesView.vue';
import MonitorView from '@/vue/views/MonitorView.vue';
import { computed, toRaw, inject } from 'vue';
import { deleteItem, getEventValue } from '@/vue/directives';
import { ActorSheetContext, RootContext } from '@/vue/SheetContext';
import MatrixHostDataModel from '@/actor/data/MatrixHostDataModel';
import BasicActorSheet from '@/vue/sheets/actor/BasicActorSheet.vue';

const context = inject<ActorSheetContext<MatrixHostDataModel>>(RootContext)!;
const system = computed(() => toRaw(context.data.actor).systemData);

async function onRatingChanged(ev: Event) {
	await toRaw(context.data.actor).update({ ['system.rating']: getEventValue(ev) });
	system.value.attributes.reset();
	await toRaw(context.data.actor).update({ ['system.attributes']: toRaw(system.value).attributes });
}

async function attributesUpdated(attributes: AdjustableMatrixAttributesDataModel) {
	await toRaw(context.data.actor).update({ ['system.attributes']: attributes });
}

async function rollIC(ic: SR6Item<MatrixICDataModel>) {
	// TODO:
	// await rollers.rollMatrixAction(toRaw(system.value), toRaw(ic) as SR6Item<MatrixActionDataModel>);
	await new MatrixActionTest({ actor: toRaw(context.data.actor), item: toRaw(ic) }).execute();
}
async function setICDamage(ic: SR6Item<MatrixICDataModel>, amount: number) {
	if (ic.systemData.monitor.damage === amount) {
		await toRaw(ic).update({ ['system.monitor.damage']: 0 });
	} else {
		await toRaw(ic).update({ ['system.monitor.damage']: amount });
	}
}
</script>

<template>
	<BasicActorSheet show-effects-tab>
		<template v-slot:data>
			<div class="matrix-host-sheet">
				<div class="section">
					<div class="section-title">Information</div>
					<label>Rating: </label><input type="number" :value="system.rating" @change="onRatingChanged" />
					<MatrixAttributesView :attributes="system.attributes" @change="attributesUpdated" />
				</div>
				<div class="section">
					<div class="section-title">Running IC</div>
					<table>
						<template v-for="ic in system.programs" :key="ic.id">
							<tr>
								<td style="width: 10%">1 {{ ic.name }}</td>
								<td style="width: 100%">
									<MonitorView
										:monitor="ic.systemData.monitor"
										@setDamage="(idx) => setICDamage(ic, idx)"
									/>
								</td>
								<td>
									<a @click="rollIC(ic)"><i class="roll-button">&nbsp;&nbsp;&nbsp;&nbsp;</i></a>
								</td>
								<td>
									<a class="fas fa-edit" @click.prevent="ic.sheet?.render(true)" />
									<a @click.prevent="deleteItem(ic)"><i class="fa-solid fa-minus"></i></a>
								</td>
							</tr>
						</template>
					</table>
				</div>
			</div>
		</template>
	</BasicActorSheet>
</template>

<style lang="scss" scoped>
.matrix-host-sheet {
	width: 100%;
	height: 100%;

	display: grid;
	// Meta, Combat Stats, Tabs, tab content
	grid-template-rows: repeat(3, auto) 1fr;
	gap: 0.5em;
}
</style>
