<script lang="ts" setup>
import BaseActorDataModel from '@/actor/data/BaseActorDataModel';
import VehicleDataModel from '@/actor/data/VehicleDataModel';
import SR6Actor from '@/actor/SR6Actor';
import { getActor } from '@/util';
import { getEventValue } from '@/vue/directives';
import { computed, toRaw, inject, ref } from 'vue';
import { ActorSheetContext, RootContext } from '@/vue/SheetContext';
import BasicActorSheet from '@/vue/sheets/actor/BasicActorSheet.vue';

const context = inject<ActorSheetContext<VehicleDataModel>>(RootContext)!;
const system = computed(() => toRaw(context.data.actor).systemData);

const pilot = ref<Maybe<SR6Actor>>(system.value.pilot);
const occupants = ref<SR6Actor[]>(system.value.occupants);

async function setAcceleration(ev: Event) {
	let newAccel = getEventValue(ev) as number;
	await toRaw(system.value).setAcceleration(newAccel);
}

async function setSpeed(ev: Event) {
	let newSpeed = getEventValue(ev) as number;
	await toRaw(system.value).setSpeed(newSpeed);
}

async function pilotRoll() {}

async function _getDragActor(ev: DragEvent): Promise<Maybe<SR6Actor>> {
	const dropJson = ev.dataTransfer?.getData('text/plain') ?? null;
	if (!dropJson) {
		return null;
	}
	const DragEventData: DragEventData = JSON.parse(dropJson);

	if (DragEventData.type !== 'Actor') {
		return null;
	}
	const actor = await getActor<SR6Actor<BaseActorDataModel>>(
		SR6Actor<BaseActorDataModel>,
		DragEventData.uuid as ActorUUID,
	);
	if (!actor) {
		return null;
	}

	if (actor.type !== 'character') {
		ui.notifications.warn('Only characters can pilot vehicles');
	}
	return actor;
}
async function onDropPilot(ev: DragEvent) {
	await setPilot(await _getDragActor(ev));
}

async function setPilot(actor: Maybe<SR6Actor>) {
	await toRaw(system.value).setPilot(toRaw(actor));
	pilot.value = actor;
}

async function onDropOccupant(idx: number, ev: DragEvent) {
	await setOccupant(idx, await _getDragActor(ev));
}

async function setOccupant(idx: number, actor: Maybe<SR6Actor>) {
	// If its an actor, make sure they arnt already in the vehicle
	if (actor) {
		if ((pilot.value && actor.uuid === pilot.value.uuid) || occupants.value.find((a) => a.uuid === actor.uuid)) {
			ui.notifications.warn('Actor already in vehicle');
			return;
		}
	}

	if (idx < occupants.value.length) {
		await toRaw(system.value).removeOccupant(toRaw(occupants.value)[idx] as unknown as SR6Actor);
	}
	await toRaw(system.value).addOccupant(actor ? toRaw(actor) : null);

	occupants.value = system.value.occupants;
}
</script>

<template>
	<BasicActorSheet show-effects-tab>
		<template v-slot:data>
			<div class="vehicle-sheet">
				<div class="vehicle-info">
					<div class="section-title">Information</div>
					<div>Max Acceleration: {{ system.stats.acceleration }}</div>
					<div>Max Speed: {{ system.stats.maxSpeed }}</div>
				</div>
				<div class="vehicle-current">
					<div class="section">
						<div class="section-title">
							Movement
							<div class="section-title-button">
								Next Round<a class="fa-solid fa-arrow-right" @click.prevent="system.nextRound()" />
							</div>
							<div style="font-size: 10px">
								Reset<a class="fa-solid fa-recycle" @click.prevent="system.resetSpeed()" />
							</div>
						</div>
						<!--<a class="fa-solid fa-plus" @click.prevent="changeSpeed(1)"></a
						><a class="fa-solid fa-minus" @click.prevent="changeSpeed(-1)"></a>-->
						<div>
							Acceleration:
							<input
								class="speed-input"
								type="number"
								:value="system.current.acceleration"
								@change.prevent="setAcceleration"
							/>
						</div>
						<div>
							Speed:
							<input
								class="speed-input"
								type="number"
								:value="system.current.speed"
								@change.prevent="setSpeed"
							/>m/s
						</div>
						<div>
							Combat Round Movement:
							{{ system.current.speed + Math.ceil(system.current.acceleration * 0.5) }}m/round
						</div>
					</div>
					<div class="section">
						<div class="section-title">Rolls</div>
						<template v-if="system.pilotPool">
							Piloting Roll ({{ system.pilotPool }})
							<a @click.prevent="pilotRoll"><i class="roll-button">&nbsp;&nbsp;&nbsp;&nbsp;</i></a>
						</template>
						<template v-else> Piloting Roll - No Pilot </template>
					</div>
					<div class="vehicle-occupants">
						<div class="section-title">Passangers</div>
						<div class="vehicle-pilot" @drop="onDropPilot">
							<template v-if="pilot">
								<div class="section-title">
									{{ pilot!.name }}
									<a @click="setPilot(null)"><i class="fa-solid fa-person-circle-minus" /></a>
								</div>
								<img :src="pilot!.img" data-edit="img" :alt="pilot!.name" width="64" height="64" />
							</template>
							<template v-else>
								<div class="section-title">Pilot</div>
								<div style="width: 64px; height: 64px; text-align: center">Empty</div>
							</template>
						</div>
						<div class="vehicle-passengers">
							<div class="section-title">Occupants</div>
							<template v-for="idx in system.seats.back" v-bind:key="idx">
								<div class="vehicle-passenger" @drop="(ev) => onDropOccupant(idx, ev)">
									<template v-if="occupants.length > idx">
										<div class="section-title">
											{{ occupants[idx].name
											}}<a @click="setOccupant(idx, null)"
												><i class="fa-solid fa-person-circle-minus"
											/></a>
										</div>
										<img
											:src="occupants[idx].img"
											data-edit="img"
											:alt="occupants[idx].name"
											width="64"
											height="64"
										/>
									</template>
									<template v-else>
										<div class="section-title">Empty</div>
										<div style="width: 64px; height: 64px; text-align: center">&nbsp;</div>
									</template>
								</div>
							</template>
						</div>
					</div>
				</div>
			</div>
		</template>
	</BasicActorSheet>
</template>

<style lang="scss" scoped>
@use '@/scss/sheets';
.vehicle-sheet {
	@extend .section;

	width: 100%;
	height: 100%;

	.vehicle-current {
		@extend .section;
		min-width: 98%;

		.speed-input {
			width: 3em;
		}

		.vehicle-occupants {
			@extend .section;
			min-width: 98%;
			.vehicle-pilot {
				@extend .section;
			}
			.vehicle-passenger {
				@extend .section;
			}
			.vehicle-passengers {
				@extend .section;
			}
		}
	}

	.vehicle-info {
		@extend .section;
		min-width: 98%;
	}
}
</style>
