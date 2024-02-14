<script lang="ts" setup>
import MatrixActionDataModel from '@/item/data/action/MatrixActionDataModel';

const props = defineProps<{
	name: string;
	action: MatrixActionDataModel;
}>();
</script>

<template>
	<div class="matrix-action section">
		<div class="section-title">
			{{ props.name }}
		</div>
		<div class="section"></div>
	</div>
</template>

<style lang="scss">
@use '@scss/sheets.scss';
@use '@scss/vars/colors.scss';

.matrix-action {
	img {
		width: 32px;
		height: 32px;
	}

	.title {
		font-weight: bold;
	}
}
</style>
