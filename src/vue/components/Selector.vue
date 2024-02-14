<script lang="ts" setup>
const props = defineProps<{
	selected: boolean;
}>();

const emit = defineEmits<{
	(e: 'click', ev: Event): void;
}>();
</script>

<template>
	<template v-if="props.selected">
		<a @click="(ev) => emit('click', ev)"><i class="fas fa-circle"></i></a>
	</template>
	<template v-else>
		<a @click="(ev) => emit('click', ev)"><i class="fa-regular fa-circle"></i></a>
	</template>
</template>
