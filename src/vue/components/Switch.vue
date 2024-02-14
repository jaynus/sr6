<script lang="ts" setup>
const props = defineProps<{
	checked: boolean;
}>();

const emit = defineEmits<{
	(e: 'change', ev: Event): void;
	(e: 'click', ev: Event): void;
}>();
</script>

<template>
	<label class="switch">
		<input
			type="checkbox"
			:checked="props.checked"
			@change="(ev) => emit('change', ev)"
			@click="(ev) => emit('click', ev)"
		/>
		<span class="slider round"></span>
	</label>
</template>
