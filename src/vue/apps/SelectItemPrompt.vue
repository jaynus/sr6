<script lang="ts" setup>
import SR6Item from '@/item/SR6Item';
import { DialogPromptContext } from '@/app/DialogPrompt';
import { RootContext } from '@/vue/SheetContext';
import { inject, ref, toRaw } from 'vue';

const selectedItem = ref<SR6Item | null>(null);
const context = inject<DialogPromptContext<SR6Item, { choices: SR6Item[] }>>(RootContext)!;

function isSelectedClass(item: SR6Item): string {
	return selectedItem.value?.uuid === item.uuid ? 'item item-selected ' : 'item';
}

function close() {
	context.resolvePromise(toRaw(selectedItem.value as SR6Item));
}
</script>

<template>
	<div class="flexcol">
		<table class="item-list">
			<tr
				v-for="item in context.data.choices"
				v-bind:key="item.uuid"
				@click.prevent="selectedItem = item"
				:class="isSelectedClass(item)"
			>
				<td class="item-image">
					<img class="profile-img" :src="item.img" :title="item.name" height="64px" width="64px" />
				</td>
				<td class="item-name">{{ item.name }}</td>
			</tr>
		</table>
		<div>
			<input type="button" class="dialog-button" value="Ok" @click="close()" />
			<input
				type="button"
				class="dialog-button"
				value="Cancel"
				@click="
					(_ev) => {
						selectedItem = null;
						close();
					}
				"
			/>
		</div>
	</div>
</template>

<style lang="scss" scoped>
@use '@/scss/vars/colors';

.app-select-item-prompt {
	.item-list {
		//border: 1px red solid;
		width: 500px;
		height: 300px;
		overflow: scroll;

		.item {
			&:hover {
				background: transparentize(colors.$blue, 0.6);
			}

			.item-image {
				width: 64px;
			}

			.item-name {
				text-align: left;
			}
		}

		.item-selected {
			border: 1px red solid;
		}
	}
}
</style>
