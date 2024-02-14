<script lang="ts" setup>
import { AdjustableMatrixAttributesDataModel } from '@/data/MatrixAttributesDataModel';

const emit = defineEmits<{
	(e: 'change', category: AdjustableMatrixAttributesDataModel): void;
}>();

const props = defineProps<{
	attributes: AdjustableMatrixAttributesDataModel;
}>();

type AttributeDragData = {
	src: string;
	value: number;
};

function dragStart(event: DragEvent, src: string, value: number) {
	event.dataTransfer?.setData('text/plain', JSON.stringify({ key: src, value: value }));
}
function drop(event: DragEvent, target: string) {
	const dragData: AttributeDragData = JSON.parse(event.dataTransfer?.getData('text/plain') ?? '{}');

	let newAttributes = foundry.utils.deepClone(props.attributes);

	let dstValue: number = 0;
	switch (target) {
		case 'attack': {
			dstValue = newAttributes.current.attack;
			newAttributes.current.attack = dragData.value;
			break;
		}
		case 'sleaze': {
			dstValue = newAttributes.current.sleaze;
			newAttributes.current.sleaze = dragData.value;
			break;
		}
		case 'dataProcessing': {
			dstValue = newAttributes.current.dataProcessing;
			newAttributes.current.dataProcessing = dragData.value;
			break;
		}
		case 'firewall': {
			dstValue = newAttributes.current.firewall;
			newAttributes.current.firewall = dragData.value;
			break;
		}
	}
	if (target !== 'attack' && newAttributes.current.attack === dragData.value) {
		newAttributes.current.attack = dstValue;
	}
	if (target !== 'sleaze' && newAttributes.current.sleaze === dragData.value) {
		newAttributes.current.sleaze = dstValue;
	}
	if (target !== 'dataProcessing' && newAttributes.current.dataProcessing === dragData.value) {
		newAttributes.current.dataProcessing = dstValue;
	}
	if (target !== 'firewall' && newAttributes.current.firewall === dragData.value) {
		newAttributes.current.firewall = dstValue;
	}

	emit('change', newAttributes);
}
function dragEnter(_event: DragEvent) {}
function dragLeave(_event: DragEvent) {}

function reset() {
	props.attributes.reset();
	emit('change', props.attributes);
}
</script>

<template>
	<div class="section">
		<div class="section-title">
			Attributes <a @click.prevent="reset"><i class="fa fa-refresh" style="margin-left: auto"></i></a>
		</div>
		<table>
			<thead>
				<tr>
					<td title="Attack">A</td>
					<td title="Sleaze">S</td>
					<td title="Data Processing">D</td>
					<td title="Firewall">F</td>
				</tr>
			</thead>
			<tbody class="matrix-attributes" title="Drag and drop to change matrix attributes">
				<tr>
					<td draggable="true" @dragstart="(ev) => dragStart(ev, 'attack', attributes.base.attack)">
						{{ attributes.base.attack }}
					</td>
					<td draggable="true" @dragstart="(ev) => dragStart(ev, 'sleaze', attributes.base.sleaze)">
						{{ attributes.base.sleaze }}
					</td>
					<td
						draggable="true"
						@dragstart="(ev) => dragStart(ev, 'dataProcessing', attributes.base.dataProcessing)"
					>
						{{ attributes.base.dataProcessing }}
					</td>
					<td draggable="true" @dragstart="(ev) => dragStart(ev, 'firewall', attributes.base.firewall)">
						{{ attributes.base.firewall }}
					</td>
				</tr>
				<tr>
					<td colspan="5" style="border-bottom: 1px solid"></td>
				</tr>
				<tr>
					<td
						draggable="true"
						@dragstart="(ev) => dragStart(ev, 'attack', attributes.current.attack)"
						@dragenter.prevent="dragEnter"
						@dragleave.prevent="dragLeave"
						@drop="(ev) => drop(ev, 'attack')"
					>
						{{ attributes.current.attack }}
					</td>
					<td
						draggable="true"
						@dragstart="(ev) => dragStart(ev, 'sleaze', attributes.current.sleaze)"
						@dragenter.prevent="dragEnter"
						@dragleave.prevent="dragLeave"
						@drop="(ev) => drop(ev, 'sleaze')"
					>
						{{ attributes.current.sleaze }}
					</td>
					<td
						draggable="true"
						@dragstart="(ev) => dragStart(ev, 'dataProcessing', attributes.current.dataProcessing)"
						@dragenter.prevent="dragEnter"
						@dragleave.prevent="dragLeave"
						@drop="(ev) => drop(ev, 'dataProcessing')"
					>
						{{ attributes.current.dataProcessing }}
					</td>
					<td
						draggable="true"
						@dragstart="(ev) => dragStart(ev, 'firewall', attributes.current.firewall)"
						@dragenter.prevent="dragEnter"
						@dragleave.prevent="dragLeave"
						@drop="(ev) => drop(ev, 'firewall')"
					>
						{{ attributes.current.firewall }}
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<style lang="scss">
@use '@scss/sheets.scss';
@use '@scss/vars/colors.scss';

.matrix-attributes {
	td {
		border: 1px solid transparent;
	}
	td:hover {
		border: 1px solid colors.$purple;
		color: colors.$purple;
		text-shadow: 0px 0px 30px colors.$purple;
		-moz-transition: all 0.2s ease-in;
		-o-transition: all 0.2s ease-in;
		-webkit-transition: all 0.2s ease-in;
		transition: all 0.2s ease-in;
	}
}
</style>
