<script lang="ts" setup>
import MatrixActionView from '@/vue/views/MatrixActionView.vue';
import { computed, inject } from 'vue';
import { ItemSheetContext, RootContext } from '@/vue/SheetContext';
import MatrixICDataModel from '@/item/data/MatrixICDataModel';
import BasicItemSheet from '@/vue/sheets/item/BasicItemSheet.vue';

const context = inject<ItemSheetContext<MatrixICDataModel>>(RootContext)!;
const system = computed(() => context.data.item.systemData);
</script>

<template>
	<BasicItemSheet show-effects-tab>
		<template v-slot:data>
			<div class="section">
				<div class="section-title">Attributes</div>
				<table>
					<thead>
						<tr>
							<td title="Attack">A</td>
							<td title="Sleaze">S</td>
							<td title="Data Processing">D</td>
							<td title="Firewall">F</td>
						</tr>
					</thead>
					<tbody class="matrix-attributes">
						<tr>
							<td title="Attack">
								{{ system.attributes ? system.attributes.attack : '-' }}
							</td>
							<td title="Sleaze">
								{{ system.attributes ? system.attributes.sleaze : '-' }}
							</td>
							<td title="Data Processing">
								{{ system.attributes ? system.attributes.dataProcessing : '-' }}
							</td>
							<td title="Firewall">
								{{ system.attributes ? system.attributes.firewall : '-' }}
							</td>
						</tr>
						<tr>
							<td>
								Attack:
								<input type="text" name="system.formulas.attack" :value="system.formulas.attack" />
							</td>
							<td>
								Defend:
								<input type="text" name="system.formulas.defend" :value="system.formulas.defend" />
							</td>
							<td>
								Damage:
								<input type="text" name="system.formulas.attack" :value="system.formulas.damage" />
							</td>
						</tr>
					</tbody>
				</table>
			</div>
			<MatrixActionView :name="context.data.item.name" :action="system" />
		</template>
	</BasicItemSheet>
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
