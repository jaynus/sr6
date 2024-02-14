<script lang="ts" setup>
import SR6Actor from '@/actor/SR6Actor';
import { DialogPromptContext } from '@/app/DialogPrompt';
import { pingActor } from '@/vue/directives';
import { RootContext } from '@/vue/SheetContext';
import { inject, computed, ref, toRaw } from 'vue';

type Filters = {
	dispositions: number[];
};

const TOKEN_DISPOSITIONS = ref(CONST.TOKEN_DISPOSITIONS);
const selectedActor = ref<SR6Actor | null>(null);
const context = inject<DialogPromptContext<SR6Actor, { self: Maybe<SR6Actor> }>>(RootContext)!;
const filters = ref<Filters>({
	dispositions: [CONST.TOKEN_DISPOSITIONS.FRIENDLY],
});
const availableActors = computed<SR6Actor[]>(() => {
	if (!game.scenes.active) {
		return [];
	}
	return game.scenes
		.active!.tokens.filter((token) => {
			if (token.actor === null) {
				return false;
			}
			if (context.data.self?.uuid === token.actor.uuid) {
				return false;
			}
			if (filters.value.dispositions.length > 0 && !filters.value.dispositions.includes(token.disposition)) {
				return false;
			}

			return true;
		})
		.map((token) => token.actor! as SR6Actor);
});

function isSelectedClass(actor: SR6Actor): string {
	return selectedActor.value?.uuid === actor.uuid ? 'actor actor-selected ' : 'actor';
}

function close() {
	context.resolvePromise(toRaw(selectedActor.value as SR6Actor));
}

function toggleFilterDisposition(val: number) {
	if (filters.value.dispositions.includes(val)) {
		filters.value.dispositions = filters.value.dispositions.filter((v) => {
			return v !== val;
		});
	} else {
		filters.value.dispositions.push(val);
	}
}
</script>

<template>
	<div class="flexcol">
		<div class="filters">
			Friendlies:
			<label class="switch">
				<input
					type="radio"
					:checked="filters.dispositions.includes(TOKEN_DISPOSITIONS.FRIENDLY)"
					@click="toggleFilterDisposition(TOKEN_DISPOSITIONS.FRIENDLY)"
				/>
				<span class="slider round"></span>
			</label>
		</div>
		<table class="actor-list">
			<tr
				v-for="actor in availableActors"
				v-bind:key="actor.uuid"
				@click.prevent="selectedActor = actor"
				:class="isSelectedClass(actor)"
			>
				<td class="actor-image">
					<a @click.prevent="pingActor(actor)">
						<img class="profile-img" :src="actor.img" :title="actor.name" height="64px" width="64px" />
					</a>
				</td>
				<td class="actor-name">{{ actor.name }}</td>
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
						selectedActor = null;
						close();
					}
				"
			/>
		</div>
	</div>
</template>

<style lang="scss" scoped>
@use '@/scss/vars/colors';

.app-select-actor-prompt {
	.actor-list {
		//border: 1px red solid;
		width: 500px;
		height: 300px;
		overflow: scroll;

		.actor {
			&:hover {
				background: transparentize(colors.$blue, 0.6);
			}

			.actor-image {
				width: 64px;
			}

			.actor-name {
				text-align: left;
			}
		}

		.actor-selected {
			border: 1px red solid;
		}
	}
}
</style>
