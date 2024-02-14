<script lang="ts" setup>
import CharacterDataModel from '@/actor/data/CharacterDataModel';
import { MagicAwakenedType } from '@/data/magic';
import MatrixActionDataModel from '@/item/data/action/MatrixActionDataModel';
import MatrixPersonaDataModel from '@/item/data/feature/MatrixPersonaDataModel';
import GearDataModel, { GearMatrixDataModel } from '@/item/data/gear/GearDataModel';

import SR6Item from '@/item/SR6Item';
import { MatrixActionTest } from '@/test/MatrixTests';
import { deleteItem } from '@/vue/directives';
import { ActorSheetContext, RootContext } from '@/vue/SheetContext';
import MatrixPersonaView from '@/vue/views/MatrixPersonaView.vue';
import ProgramSlotsView from '@/vue/views/ProgramSlotsView.vue';
import MonitorView from '@/vue/views/MonitorView.vue';
import { computed, inject, toRaw, ref, onBeforeUpdate } from 'vue';
import { Collapse } from 'vue-collapsed';

const context = inject<ActorSheetContext<CharacterDataModel>>(RootContext)!;
const system = computed(() => context.data.actor.systemData);

type MatrixEntry = {
	pool: number;
	action: SR6Item<MatrixActionDataModel>;
};

const matrixActions = ref<MatrixEntry[]>();

const matrixDevices = computed(() =>
	toRaw(context.data.actor)
		.items.filter((i) => i.type === 'gear')
		.map((i) => i as SR6Item<GearDataModel>)
		.filter((i) => i.systemData.matrix)
		.sort((a, b) => a.name.localeCompare(b.name)),
);

const deviceVisible = ref(
	matrixDevices.value.map((device) => {
		return {
			id: device.id,
			visible: false,
			descriptionVisible: false,
			wirelessBonusVisible: false,
		};
	}),
);

const persona = computed(() => {
	let persona = toRaw(context.data.actor).items.find((i) => i.type === 'matrix_persona');
	if (persona) {
		return persona as SR6Item<MatrixPersonaDataModel>;
	} else {
		return null;
	}
});

async function updateMatrixActions(): Promise<void> {
	const actions = toRaw(context.data.actor)
		.items.filter((i) => i.type === 'matrix_action')
		.sort((a, b) => a.name.localeCompare(b.name))
		.map((i) => i as SR6Item<MatrixActionDataModel>)
		.map((i) => {
			return {
				action: i,
				pool: 0,
			};
		});
	for (const entry of actions) {
		entry.pool = await getMatrixActionPool(entry.action);
	}
	matrixActions.value = actions;
}
await updateMatrixActions();

function getPersona(): null | MatrixPersonaDataModel {
	return persona.value ? persona.value!.systemData : null;
}

function getMatrixModel(gear: GearDataModel): GearMatrixDataModel {
	return gear.matrix!;
}

async function rollMatrixAction(action: SR6Item<MatrixActionDataModel>) {
	if (toRaw(action).systemData.pool > 0) {
		// await rollers.rollMatrixAction(toRaw(context.data.actor).systemData, toRaw(action));
		await new MatrixActionTest({ actor: toRaw(context.data.actor), item: toRaw(action) }).execute();
	} else {
		await action.systemData.toMessage();
	}
}

function addMatrixAction() {
	// TODO:
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
				i.systemData.matrix ? i.systemData.matrix!.active && i.systemData.matrix!.simModes.length > 0 : false,
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
	await updateMatrixActions();
}
async function onProgramSlotsUpdated(_model: GearMatrixDataModel) {
	// await toRaw(model.item!).update({ ['system.matrix._programs']: model. });
	await updateMatrixActions();
}

async function setDeviceDamage(device: SR6Item<GearDataModel>, value: number) {
	if (device.systemData.monitors.matrix!.damage === value) {
		await toRaw(device).update({ ['system.monitors.matrix.damage']: 0 });
	} else {
		await toRaw(device).update({ ['system.monitors.matrix.damage']: value });
	}
}

async function getMatrixActionPool(action: SR6Item<MatrixActionDataModel>): Promise<number> {
	if (action.systemData.pool > 0) {
		const test = new MatrixActionTest({ actor: toRaw(context.data.actor), item: toRaw(action) });
		return (await test.prepared()).data.pool!;
	} else {
		return 0;
	}
}

onBeforeUpdate(() => {
	if (deviceVisible.value.length !== matrixDevices.value.length) {
		deviceVisible.value = matrixDevices.value.map((device) => {
			return {
				id: device.id,
				visible: false,
				descriptionVisible: false,
				wirelessBonusVisible: false,
			};
		});
	}
});
</script>

<template>
	<section class="tab-matrix">
		<div class="section" style="width: 30%">
			<div class="section-title">Matrix Actions</div>
			<table
				class="field-table"
				style="align-self: start; border-collapse: collapse; margin: 0; padding: 0; width: 100%"
			>
				<thead>
					<tr class="field-table">
						<td>Skill</td>
						<td>Pool</td>
						<td>
							<a v-if="context.user.isGM" class="fas fa-plus" @click.prevent="addMatrixAction" />
						</td>
					</tr>
				</thead>
				<tr v-for="{ action, pool } in matrixActions" :key="action.id" :title="action.systemData.description">
					<td style="width: 100%">{{ action.name }}</td>
					<td>{{ pool }}</td>
					<td>
						<a @click="rollMatrixAction(action)"><i class="roll-button">&nbsp;&nbsp;&nbsp;&nbsp;</i></a>
					</td>
				</tr>
			</table>
		</div>
		<div class="section wireless-section">
			<MatrixPersonaView :persona="getPersona()" @change="onPersonaUpdated" @togglePersona="togglePersona" />
			<div class="section wireless-devices">
				<div class="section-title">Wireless Devices</div>
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
											(v) => v.id == device.id,
										)!.visible
									"
									@dblclick.prevent="device.sheet?.render(true)"
									><i class="fa-solid fa-down-from-line"></i> {{ device.name }}</a
								>
							</td>
							<td>
								<template v-if="device.systemData.matrix!.attributes != null">
									{{ device.systemData.matrix!.attributes!.a }}
									{{ device.systemData.matrix!.attributes!.s }}
									{{ device.systemData.matrix!.attributes!.d }}
									{{ device.systemData.matrix!.attributes!.f }}
								</template>
							</td>
							<td>
								<template
									v-if="
										device.systemData.matrix !== null &&
										device.systemData.matrix!.totalProgramSlots > 0
									"
								>
									{{ device.systemData.matrix!.programSlots.available }}/{{
										device.systemData.matrix!.programSlots.total
									}}
								</template>
							</td>
							<td class="buttons">
								<a class="fas fa-edit" @click.prevent="device.sheet?.render(true)" />&nbsp;<a
									class="fas fa-trash"
									@click.prevent="deleteItem(device)"
								/>
							</td>
						</tr>
						<tr>
							<td colspan="10">
								<Collapse :when="deviceVisible.find((v) => v.id == device.id)!.visible">
									<div>
										<MonitorView
											v-if="device.systemData.monitors.matrix !== null"
											:icon="device.img"
											:monitor="device.systemData.monitors.matrix!"
											@setDamage="(idx) => setDeviceDamage(device, idx)"
										/>
										<ProgramSlotsView
											v-if="
												device.systemData.matrix !== null &&
												device.systemData.matrix!.totalProgramSlots > 0
											"
											:model="getMatrixModel(device.systemData)"
											@change="onProgramSlotsUpdated"
										/>
										<div
											v-if="device.systemData.matrix!.wirelessBonus != null"
											class="section description"
											style="width: 99%"
										>
											<div class="section-title">
												<a
													@click="
														deviceVisible.find(
															(v) => v.id == device.id,
														)!.wirelessBonusVisible = !deviceVisible.find(
															(v) => v.id == device.id,
														)!.wirelessBonusVisible
													"
													@dblclick.prevent="device.sheet?.render(true)"
													><i class="fa-solid fa-down-from-line"></i> Wireless Bonus</a
												>
											</div>
											<Collapse
												:when="
													deviceVisible.find((v) => v.id == device.id)!.wirelessBonusVisible
												"
											>
												{{ device.systemData.matrix!.wirelessBonus!.description }}
											</Collapse>
										</div>
										<div class="section description" style="width: 99%">
											<div class="section-title">
												<a
													@click="
														deviceVisible.find(
															(v) => v.id == device.id,
														)!.descriptionVisible = !deviceVisible.find(
															(v) => v.id == device.id,
														)!.descriptionVisible
													"
													@dblclick.prevent="device.sheet?.render(true)"
													><i class="fa-solid fa-down-from-line"></i> Description</a
												>
											</div>
											<Collapse
												:when="deviceVisible.find((v) => v.id == device.id)!.descriptionVisible"
											>
												{{ device.systemData.description }}
											</Collapse>
										</div>
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

		.description {
			font-size: 10px;
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
