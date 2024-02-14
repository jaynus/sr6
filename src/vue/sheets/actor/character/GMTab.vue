<script lang="ts" setup>
import BaseDataModel from '@/data/BaseDataModel';
import SR6Item from '@/item/SR6Item';
import { createNewItem, deleteItem } from '@/vue/directives';
import { inject, toRaw } from 'vue';

import CharacterDataModel from '@/actor/data/CharacterDataModel';
import { ActorSheetContext, RootContext } from '@/vue/SheetContext';

const context = inject<ActorSheetContext<CharacterDataModel>>(RootContext)!;
</script>

<template>
	<section v-if="context.user.isGM" class="tab-gm">
		<div class="section-actions">
			<div class="section-title">
				<h2 class="section-title">Edge Actions</h2>
				<a class="fas fa-plus" @click.prevent="createNewItem(context.data.actor, 'edge_action')" />
			</div>
			<table>
				<tr
					v-for="action in toRaw(context.data.actor).items.filter((i) => i.type === 'edge_action')"
					v-bind:key="action.id"
				>
					<td>{{ action.name }}</td>
					<td>
						<a @click.prevent="action.sheet?.render(true)"><i class="fas fa-edit" /></a
						><a @click.prevent="deleteItem(action as SR6Item<BaseDataModel>)"><i class="fas fa-trash" /></a>
					</td>
				</tr>
			</table>
		</div>
	</section>
</template>

<style lang="scss" scoped>
@use '@scss/vars/colors';
@use '@scss/sheets';

.tab-gm {
	@extend .flexrow !optional;
	.section-actions {
		@extend .section;
		width: 30%;
	}
}
</style>
