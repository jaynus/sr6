<script setup lang="ts">
import { Collapse } from 'vue-collapsed';

const props = defineProps<{
	when: boolean;
	class?: string;
	as?: keyof HTMLElementTagNameMap;
}>();
</script>

<template>
	<div class="collapse-container">
		<Collapse :class="`float-collapse ${props.class}`" :when="when" :as="as">
			<slot></slot>
		</Collapse>
	</div>
</template>
