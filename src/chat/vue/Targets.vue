/* eslint-disable vue/multi-word-component-names */
<script lang="ts" setup>
import SR6Actor from '@/actor/SR6Actor';
import Localized from '@/vue/components/Localized.vue';
import { pingActor } from '@/vue/directives';

const props = defineProps<{
	targets: SR6Actor[];
}>();
</script>

<template>
	<div class="chat-head"><Localized label="SR6.Labels.Targets" /></div>

	<div class="chat-target-box">
		<template v-for="target in props.targets" v-bind:key="target.id">
			<a @click.prevent="pingActor(target)">
				<div>
					{{ target.name }}
				</div></a
			>
		</template>
	</div>
</template>

<style lang="scss" scoped></style>
