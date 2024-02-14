<script lang="ts" setup>
import { ref } from 'vue';

const props = defineProps<{
	function: () => Promise<string>;
}>();

const value = ref<string | undefined>(undefined);
value.value = await props.function();
</script>

<template>
	{{ value }}
</template>

<style lang="scss">
@use '@scss/sheets.scss';
@use '@scss/vars/colors.scss';
</style>
