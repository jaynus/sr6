<script lang="ts" setup>
import CharacterDataModel from '@/actor/data/CharacterDataModel';
import { MagicAwakenedType } from '@/data/magic';
import { AdjustableMatrixAttributesDataModel } from '@/data/MatrixAttributesDataModel';
import MatrixActionDataModel from '@/item/data/action/MatrixActionDataModel';
import MatrixPersonaDataModel from '@/item/data/feature/MatrixPersonaDataModel';
import GearDataModel, { GearMatrixDataModel } from '@/item/data/gear/GearDataModel';

import SR6Item from '@/item/SR6Item';
import * as rollers from '@/roll/Rollers';
import { deleteItem } from '@/vue/directives';
import { ActorSheetContext, RootContext } from '@/vue/SheetContext';
import MatrixAttributesView from '@/vue/views/MatrixAttributesView.vue';
import MatrixPersonaView from '@/vue/views/MatrixPersonaView.vue';
import MatrixProgramSlotsView from '@/vue/views/MatrixProgramSlotsView.vue';
import MonitorView from '@/vue/views/MonitorView.vue';
import { computed, inject, toRaw, ref } from 'vue';
import { Collapse } from 'vue-collapsed';

const context = inject<ActorSheetContext<CharacterDataModel>>(RootContext)!;
const system = computed(() => context.data.actor.systemData);

const matrixActions = computed(
	() =>
		toRaw(context.data.actor)
			.items.filter((i) => i.type === 'matrix_action')
			.sort((a, b) => a.name.localeCompare(b.name)) as SR6Item<MatrixActionDataModel>[]
);

const matrixDevices = computed(() =>
	toRaw(context.data.actor)
		.items.filter((i) => i.type === 'gear')
		.map((i) => i as SR6Item<GearDataModel>)
		.filter((i) => i.systemData.matrix)
		.sort((a, b) => a.name.localeCompare(b.name))
);

const deviceVisible = ref(
	matrixDevices.value.map((device) => {
		return {
			id: device.id,
			visible: false,
		};
	})
);

matrixDevices.value.forEach((device) => {
	console.log('monitor', device, device.systemData.monitors);
});

const persona = computed(() => {
	let persona = toRaw(context.data.actor).items.find((i) => i.type === 'matrix_persona');
	if (persona) {
		return persona as SR6Item<MatrixPersonaDataModel>;
	} else {
		return null;
	}
});
const hasPersona = computed(() => persona.value !== null);

async function rollMatrixAction(action: SR6Item<MatrixActionDataModel>) {
	if (action.systemData.pool > 0) {
		await rollers.rollMatrixAction(toRaw(context.data.actor).systemData, toRaw(action));
	} else {
		await action.systemData.toMessage();
	}
}

function addMatrixAction() {}

async function addCoreActions() {
	await toRaw(system.value)._addCoreMatrixActions();
}

async function toggleMatrixDevice(device: SR6Item<GearDataModel>): Promise<boolean> {
	let status = device.systemData.toggleWireless();

	if (persona.value) {
		if (device.uuid === persona.value.systemData.sourceDeviceId) {
			ui.notifications.warn('Toggled active matrix persona device, disabling persona');
			await togglePersona(false);
		}
	}

	return status;
}

async function togglePersona(checked: boolean, cb?: (checked: boolean) => void): Promise<boolean> {
	// Find an active device to activate with
	if (!checked) {
		await toRaw(system.value).deactivateMatrixPersona();
	} else {
		if (context.data.actor.systemData.magicAwakened === MagicAwakenedType.Technomancer) {
			const newPersona = await toRaw(system.value).activateMatrixPersona(null);
			newPersona.systemData.attributes.reset();
		} else {
			const activeDevice = matrixDevices.value.find((i) =>
				i.systemData.matrix
					? i.systemData.matrix!.active && i.systemData.matrix!.supportsModes.length > 0
					: false
			);
			if (!activeDevice) {
				ui.notifications.error('You do not have an active matrix device to enter the matrix with!');
				if (cb) {
					cb(false);
				}
				return false;
			}
			const newPersona = await toRaw(system.value).activateMatrixPersona(activeDevice);
			newPersona.systemData.attributes.reset();
		}
	}

	return true;
}

async function onPersonaUpdated(newPersona: MatrixPersonaDataModel) {
	await toRaw(persona.value!).update({ ['system']: newPersona });
}
async function onProgramSlotsUpdated(model: GearMatrixDataModel) {
	await toRaw(model.item!).update({ ['system.matrix']: model });
}

async function setDeviceDamage(device: SR6Item<GearDataModel>, value: number) {
	if (device.systemData.monitors.matrix!.damage === value) {
		await toRaw(device).update({ ['system.monitors.matrix.damage']: 0 });
	} else {
		await toRaw(device).update({ ['system.monitors.matrix.damage']: value });
	}
}
</script>

<template>
	<section class="tab-matrix">
		<div class="section" style="width: 30%">
			<div class="section-head">Matrix Actions</div>
			<table
				class="field-table"
				style="align-self: start; border-collapse: collapse; margin: 0; padding: 0; width: 100%"
			>
				<thead>
					<tr class="field-table">
						<td>Skill</td>
						<td>Pool</td>
						<td>
							<a v-if="context.user.isGM" class="fas fa-plus" @click.prevent="addMatrixAction" /><a
								v-if="context.user.isGM && matrixActions.length == 0"
								class="fas fa-infinity"
								@click.prevent="addCoreActions"
							/>
						</td>
					</tr>
				</thead>
				<tr v-for="action in matrixActions" :key="action.id" :title="action.systemData.description">
					<td style="width: 100%">{{ action.name }}</td>
					<td>{{ action.systemData.pool }}</td>
					<td>
						<a @click="rollMatrixAction(action)" data-die="A"
							><i class="roll-button">&nbsp;&nbsp;&nbsp;&nbsp;</i></a
						>
					</td>
				</tr>
			</table>
		</div>
		<div class="section wireless-section">
			<MatrixPersonaView
				:persona="(persona) ? persona!.systemData : null"
				@change="onPersonaUpdated"
				@togglePersona="togglePersona"
			/>
			<div class="section wireless-devices">
				<div class="section-head">Wireless Devices</div>
				<table>
					<thead>
						<tr>
							<td></td>
							<td>Name</td>
							<td>A/S/D/F</td>
							<td>Slots</td>
							<td></td>
						</tr>
					</thead>
					<template v-for="device in matrixDevices" :key="device.id">
						<tr class="device-details">
							<td style="width: 1%">
								<label class="switch">
									<input
										type="checkbox"
										@change.prevent="toggleMatrixDevice(device)"
										:checked="device.systemData.matrix!.active"
									/>
									<span class="slider round"></span>
								</label>
							</td>
							<td>
								<a
									@click="
										deviceVisible.find((v) => v.id == device.id)!.visible = !deviceVisible.find(
											(v) => v.id == device.id
										)!.visible
									"
									@dblclick.prevent="device.sheet?.render(true)"
									><i class="fa-solid fa-down-from-line"></i> {{ device.name }}</a
								>
							</td>
							<td>
								{{ device.systemData.matrix!.attributes!.a }}
								{{ device.systemData.matrix!.attributes!.s }}
								{{ device.systemData.matrix!.attributes!.d }}
								{{ device.systemData.matrix!.attributes!.f }}
							</td>
							<td>
								{{ device.systemData.matrix!.programSlots.available }}/{{
									device.systemData.matrix!.programSlots.total
								}}
							</td>
							<td class="buttons">
								<a class="fas fa-edit" @click.prevent="device.sheet?.render(true)" />&nbsp;<a
									class="fas fa-minus"
									@click.prevent="deleteItem(device)"
								/>
							</td>
						</tr>
						<tr>
							<td colspan="10">
								<Collapse :when="deviceVisible.find((v) => v.id == device.id)!.visible">
									<div>
										<MonitorView
											:icon="device.img"
											:monitor="device.systemData.monitors.matrix!"
											@setDamage="(idx) => setDeviceDamage(device, idx)"
										/>
										<MatrixProgramSlotsView
											v-if="device.systemData.matrix!.programSlots.total > 0"
											:model="device.systemData.matrix!"
											@change="onProgramSlotsUpdated"
										/>
									</div>
								</Collapse>
							</td>
						</tr>
					</template>
				</table>
			</div>
		</div>
	</section>
</template>

<style lang="scss" scoped>
@use '@scss/vars/colors.scss';
@use '@scss/sheets.scss';

.wireless-section {
	width: 375px;

	.wireless-devices {
		width: 99%;
		table {
		}

		.device-details {
			td {
				width: 1%;
				white-space: nowrap;
				padding-right: 10px;
			}

			.buttons {
				text-align: right;
				margin-left: auto;
			}
		}
	}
}
</style>
