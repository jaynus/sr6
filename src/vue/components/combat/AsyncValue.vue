<script lang="ts" setup>
import AsyncValueInner from '@/vue/components/AsyncValueInner.vue';

const props = defineProps<{
	function: () => Promise<string>;
}>();
</script>

<template>
	<Suspense>
		<AsyncValueInner :function="props.function" />
	</Suspense>
</template>

<style lang="scss">
@use '@scss/sheets.scss';
@use '@scss/vars/colors.scss';
</style>
