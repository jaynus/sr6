<script lang="ts" setup>
import { InitiativeType } from '@/data';
import { IHasInitiative } from '@/data/interfaces';
import { MatrixSimType } from '@/data/matrix';
import { AdjustableMatrixAttributesDataModel } from '@/data/MatrixAttributesDataModel';
import MatrixPersonaDataModel, { PersonaType } from '@/item/data/feature/MatrixPersonaDataModel';
import Localized from '@/vue/components/Localized.vue';
import { getEventValue } from '@/vue/directives';
import * as images from '@/vue/images';
import MatrixAttributesView from '@/vue/views/MatrixAttributesView.vue';
import MonitorView from '@/vue/views/MonitorView.vue';
import { computed, toRaw } from 'vue';

const emit = defineEmits<{
	(e: 'change', persona: MatrixPersonaDataModel): void;
	(e: 'togglePersona', status: boolean, cb: (checked: boolean) => void): void;
}>();

const props = defineProps<{
	persona: MatrixPersonaDataModel | null;
}>();

const initiative = computed(
	() => (toRaw(props.persona!.actor!.systemData) as unknown as IHasInitiative).getInitiative(InitiativeType.Matrix)!,
);

async function onAttributesUpdated(attributes: AdjustableMatrixAttributesDataModel) {
	if (props.persona) {
		props.persona.attributes = attributes;
		emit('change', props.persona);
	}
}

async function togglePersona(ev: Event) {
	const target = ev.target as HTMLInputElement;
	emit('togglePersona', target.checked, (checked: boolean): void => {
		target.checked = checked;
	});
}

async function setDeviceDamage(value: number) {
	if (props.persona!.sourceDevice?.systemData.monitors.matrix!.damage === value) {
		await toRaw(props.persona!).sourceDevice?.update({ ['system.monitors.matrix.damage']: 0 });
	} else {
		await toRaw(props.persona!).sourceDevice?.update({ ['system.monitors.matrix.damage']: value });
	}
}

function getPersonaName(): string {
	switch (props.persona!.type) {
		case PersonaType.Living: {
			return 'Living Persona';
		}
		case PersonaType.Device: {
			return props.persona!.sourceDevice!.name;
		}
		case PersonaType.IC: {
			return 'IC';
		}
	}
}

function changeOverwatchScore(ev: Event) {
	const newScore = getEventValue(ev) as number;
	props.persona!.setOverwatch(newScore);
	emit('change', props.persona!);
}

function changeNoise(ev: Event) {
	const newScore = getEventValue(ev) as number;
	props.persona!.setNoise(newScore);
	emit('change', props.persona!);
}
</script>

<template>
	<div class="section matrix-persona">
		<div class="section-title">
			Persona
			<i style="font-style: italic; margin-left: 20px" v-if="props.persona">({{ getPersonaName() }})</i>
			<span style="margin-left: auto; margin-right: 0"
				><label class="switch">
					<input type="checkbox" @change.prevent="togglePersona" :checked="props.persona != null" />
					<span class="slider round"></span> </label
			></span>
		</div>
		<template v-if="props.persona">
			<div class="flexrow">
				<table class="info-table">
					<tr>
						<td class="title">Mode</td>
						<td>
							<select v-model="props.persona.simType" @change.prevent="emit('change', props.persona)">
								<option
									v-for="simType in Object.keys(MatrixSimType)"
									v-bind:key="simType"
									:value="MatrixSimType[simType as keyof typeof MatrixSimType]"
								>
									<Localized :label="`SR6.Matrix.SimType.${simType}`" />
								</option>
							</select>
						</td>
						<td rowspan="10">
							<div class="flexcol">
								<div class="text-atop" style="margin: auto; top: -20px">
									<img
										:src="images.noise"
										style="left: 7px; width: 32px; height: 32px; opacity: 0.5"
										alt="Noise Level"
									/>
									<label style="margin: auto" class="overwatch-value"
										><input
											type="number"
											style="color: rgba(255, 204, 203, 1); font-weight: bold"
											:value="props.persona.noise.damage"
											@change="changeNoise"
											title="Noise Level"
									/></label>
								</div>
								<div class="text-atop" style="margin: auto">
									<img
										:src="images.god"
										style="width: 48px; height: 48px; opacity: 0.5"
										alt="Overwatch Score"
									/>
									<label style="margin: auto" class="overwatch-value"
										><input
											type="number"
											style="color: rgba(255, 204, 203, 1); font-weight: bold"
											:value="props.persona.overwatchScore.damage"
											@change="changeOverwatchScore"
											title="Overwatch Score"
									/></label>
								</div>
							</div>
						</td>
					</tr>
					<tr>
						<td class="title">Initiative</td>
						<td>
							<i class="bold-value"
								>{{ initiative.score }} <span>+ {{ initiative.dice }}d6</span></i
							>
						</td>
					</tr>
					<tr>
						<td class="title">Attack Rating</td>
						<td class="bold-value">{{ props.persona.attackRating }}</td>
					</tr>
					<tr>
						<td class="title">Defense Rating</td>
						<td class="bold-value">{{ props.persona.defenseRating() }}</td>
					</tr>
				</table>
				<div class="flex-break"></div>
				<MonitorView
					v-if="props.persona.sourceDevice"
					:icon="props.persona.sourceDevice.img"
					:monitor="props.persona.sourceDevice.systemData.monitors.matrix!"
					@setDamage="(idx) => setDeviceDamage(idx)"
				/>
				<div class="flex-break"></div>
				<MatrixAttributesView
					v-if="props.persona"
					:attributes="props.persona.attributes"
					@change="onAttributesUpdated"
				/>
			</div>
		</template>
	</div>
</template>

<style lang="scss">
@use '@scss/sheets.scss';
@use '@scss/vars/colors.scss';
@use '@scss/mixins/reset';

.overwatch-value {
	@extend .text-atop-value;
	top: 0px;
}

.matrix-persona {
	width: 99%;

	@include reset.input;

	.bold-value {
		font-weight: bold;
	}

	.info-table {
		padding: 0;
		margin: 0;

		.title {
			padding-right: 10px;
			width: 1%;
		}

		td {
			overflow: hidden;
			white-space: nowrap;
		}
	}
}
</style>
