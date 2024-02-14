<script lang="ts" setup>
import { IModifier } from '@/modifier';
import { Collapse } from 'vue-collapsed';
import { ref, watch } from 'vue';

const props = defineProps<{
	modifiers: IModifier[];
}>();

const modifiersDescriptionVisible = ref(
	props.modifiers.map((_modifier: IModifier, idx: number) => {
		return {
			id: idx,
			visible: false,
		};
	}),
);

watch(props, () => {
	modifiersDescriptionVisible.value = props.modifiers.map((_modifier: IModifier, idx: number) => {
		return {
			id: idx,
			visible: false,
		};
	});
});
</script>

<template>
	<div class="modifiers-view">
		<div class="section-title">Active Modifiers</div>
		<div v-if="modifiers.length > 0" class="section" style="width: 100%">
			<table class="inner-table">
				<tr v-for="(modifier, idx) in modifiers" v-bind:key="idx">
					<td>
						<table class="inner-table">
							<tr>
								<td style="width: 3em; white-space: nowrap">
									{{ modifier.displayValue }}
								</td>
								<td style="padding-left: 7px">
									<a
										@click="
											modifiersDescriptionVisible.find((v) => v.id == idx)!.visible =
												!modifiersDescriptionVisible.find((v) => v.id == idx)!.visible
										"
										>{{ modifier.name }}</a
									>
								</td>
							</tr>
							<tr>
								<td class="hint" colspan="3">
									<Collapse :when="modifiersDescriptionVisible.find((v) => v.id == idx)!.visible">
										<div v-html="modifier.description"></div>
									</Collapse>
								</td>
							</tr>
						</table>
					</td>
				</tr>
			</table>
		</div>
	</div>
</template>

<style lang="scss">
@use '@scss/sheets.scss';
@use '@scss/vars/colors.scss';

.inner-table {
	padding: 0;
	margin: 0;
	border: 0;
	tr {
		padding: 0;
		margin: 0;
		border: 0;
	}
	td {
		padding: 2px;
		margin: 0;
		border: 0;
	}
}

.modifiers-view {
	@extend .section;

	width: 100%;
}
</style>
