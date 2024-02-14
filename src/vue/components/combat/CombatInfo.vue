<script lang="ts" setup>
import CharacterDataModel from '@/actor/data/CharacterDataModel';
import SR6Combat from '@/combat/SR6Combat';
import { CombatantFlagData } from '@/combat/SR6Combatant';
import { ActorSheetContext, RootContext } from '@/vue/SheetContext';
import { inject, toRaw } from 'vue';

const context = inject<ActorSheetContext<CharacterDataModel>>(RootContext)!;

function getCombatData(): null | CombatantFlagData {
	if (context.data.combat) {
		const combatData = (toRaw(context.data.combat)! as SR6Combat).getCombatantData(context.data.actor!);
		if (combatData) {
			return combatData;
		}
	}
	return null;
}
</script>

<template>
	<div class="combat-info">
		<template v-if="context.data.actor.inCombat">
			<table class="actions-table">
				<thead>
					<tr>
						<td></td>
						<td>Available</td>
						<td>Total</td>
					</tr>
				</thead>
				<tr>
					<td>Major Actions</td>
					<td class="value">{{ getCombatData()!.roundActions.major }}</td>
					<td class="value">{{ getCombatData()!.availableActions.major }}</td>
				</tr>
				<tr>
					<td>Minor Actions</td>
					<td class="value">{{ getCombatData()!.roundActions.minor }}</td>
					<td class="value">{{ getCombatData()!.availableActions.minor }}</td>
				</tr>
			</table>
		</template>
	</div>
</template>

<style lang="scss" scoped>
@use '@scss/vars/colors.scss';
@use '@scss/sheets.scss';

.combat-info {
	width: 100%;
	.actions-table {
		td {
			text-align: center;
		}

		.value {
			font-weight: bold;
		}
	}
}
</style>
