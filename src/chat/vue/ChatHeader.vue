/* eslint-disable vue/multi-word-component-names */
<script lang="ts" setup>
import SR6Actor from '@/actor/SR6Actor';
import { SR6Token } from '@/token/SR6Token';
import { pingActor } from '@/vue/directives';
import { Collapse } from 'vue-collapsed';
import { toRaw, ref } from 'vue';

const props = defineProps<{
	actor: Maybe<SR6Actor>;
	token: Maybe<SR6Token>;
	text: { title: string; hint: string };
}>();

function openActorSheet() {
	if (props.actor) {
		void toRaw(props.actor).sheet.render(true);
	}
}

const expandHint = ref(false);
</script>

<template>
	<div class="flexrow chat-message-header" @mouseenter="expandHint = true" @mouseleave="expandHint = false">
		<div class="actor-image" v-if="props.actor">
			<a @click.prevent="pingActor(props.actor)" @dblclick.prevent="openActorSheet()">
				<img
					class="profile-img"
					:src="props.actor.img"
					:title="props.actor.name"
					data-edit="img"
					height="24"
					width="24"
				/>
			</a>
		</div>
		<div class="title">{{ props.text.title }}</div>
	</div>
	<div style="min-width: 100%">
		<Collapse :when="expandHint" class="formula">
			{{ props.text.hint }}
		</Collapse>
	</div>
</template>

<style lang="scss" scoped>
.chat-message-header {
	min-width: 100%;
	.actor-image {
		flex: 0 0 auto;
		min-width: 25px;
		width: min-content;
	}

	.title {
		font-size: 16px;
		font-family: var(--font-header);
		width: max-content;
		flex-wrap: nowrap;
		text-align: center;
	}
}
</style>
