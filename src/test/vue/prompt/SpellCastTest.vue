/* eslint-disable vue/multi-word-component-names */
<script lang="ts" setup>
import LifeformDataModel from '@/actor/data/LifeformDataModel';
import { damageFromSpellAdjustments, drainFromSpellAdjustments } from '@/item/data/SpellDataModel';
import { SpellAdjustmentType } from '@/data/magic';
import { SpellCastTest } from '@/test/SpellTests';
import Localized from '@/vue/components/Localized.vue';
import { ref, toRaw } from 'vue';

const props = defineProps<{
	test: SpellCastTest;
}>();

const emit = defineEmits<{
	(e: 'setText', value: { title: string; hint: string }): void;
}>();

const actionName = ref(props.test.spell.name);
const actionDescription = ref(props.test.spell.systemData.description);

const maxAmps = ref((toRaw(props.test.actor).systemData as LifeformDataModel).spellAmps);

function currentAmps(): number {
	let n = 0;

	n += props.test.data.adjustments![SpellAdjustmentType.AmpUp];
	n += props.test.data.adjustments![SpellAdjustmentType.ShiftArea];
	n += props.test.data.adjustments![SpellAdjustmentType.IncreaseArea];

	return n;
}

function adjustAmp(amp: SpellAdjustmentType, val: number) {
	if (props.test.data.adjustments![amp] === 0 && val === -1) {
		return;
	}
	if (currentAmps() === maxAmps.value && val === 1) {
		return;
	}
	props.test.data.adjustments![amp] += val;
}

function currentDamage(): number {
	return toRaw(props.test).spell.systemData.baseDamage + damageFromSpellAdjustments(props.test.data.adjustments!);
}
function currentDrain(): number {
	return toRaw(props.test).spell.systemData.drain + drainFromSpellAdjustments(props.test.data.adjustments!);
}

emit('setText', {
	title: `Cast Spell (${actionName.value})`,
	hint: ``,
});
</script>

<template>
	<div class="flexcol matrix-action-test-prompt">
		<div class="section">
			<div class="section-title">Description</div>
			{{ actionDescription }}
		</div>
		<div class="section amps">
			<div class="flexrow section-title amps-title">
				Spell Adjustments
				<div class="amp-count">{{ currentAmps() }} / {{ maxAmps }}</div>
			</div>
			<table class="amps-table">
				<tr>
					<td class="amp-actions">
						<a class="fa-solid fa-plus" @click.prevent="adjustAmp(SpellAdjustmentType.AmpUp, 1)"></a
						><a class="fa-solid fa-minus" @click.prevent="adjustAmp(SpellAdjustmentType.AmpUp, -1)"></a>
					</td>
					<td class="amp-number">{{ test.data.adjustments![SpellAdjustmentType.AmpUp] }}</td>
					<td class="amp-title"><Localized label="SR6.Magic.SpellAdjustments.AmpUp.Name" /></td>
					<td class="amp-description"><Localized label="SR6.Magic.SpellAdjustments.AmpUp.Description" /></td>
				</tr>
				<tr>
					<td class="amp-actions">
						<a class="fa-solid fa-plus" @click.prevent="adjustAmp(SpellAdjustmentType.IncreaseArea, 1)"></a
						><a
							class="fa-solid fa-minus"
							@click.prevent="adjustAmp(SpellAdjustmentType.IncreaseArea, -1)"
						></a>
					</td>
					<td class="amp-number">{{ test.data.adjustments![SpellAdjustmentType.IncreaseArea] }}</td>
					<td class="amp-title"><Localized label="SR6.Magic.SpellAdjustments.IncreaseArea.Name" /></td>
					<td class="amp-description">
						<Localized label="SR6.Magic.SpellAdjustments.IncreaseArea.Description" />
					</td>
				</tr>
				<tr>
					<td class="amp-actions">
						<a class="fa-solid fa-plus" @click.prevent="adjustAmp(SpellAdjustmentType.ShiftArea, 1)"></a
						><a class="fa-solid fa-minus" @click.prevent="adjustAmp(SpellAdjustmentType.ShiftArea, -1)"></a>
					</td>
					<td class="amp-number">{{ test.data.adjustments![SpellAdjustmentType.ShiftArea] }}</td>
					<td class="amp-title"><Localized label="SR6.Magic.SpellAdjustments.ShiftArea.Name" /></td>
					<td class="amp-description">
						<Localized label="SR6.Magic.SpellAdjustments.ShiftArea.Description" />
					</td>
				</tr>
			</table>
		</div>
		<div class="section">
			<div class="section-title"><Localized label="SR6.Labels.Information" /></div>
			<table>
				<tr>
					<td>
						<template v-if="test.spell.systemData.formulas.damage">
							<Localized label="SR6.Combat.Damage" /> Formula:
							{{ test.spell.systemData.formulas.damage }}
						</template>
					</td>
					<td>Base <Localized label="SR6.Combat.Damage" />: {{ currentDamage() }}</td>
					<td><Localized label="SR6.Labels.Drain" />: {{ currentDrain() }}</td>
				</tr>
				<tr>
					<td><Localized label="SR6.Combat.AttackRating" />: {{ test.data.attackRating }}</td>
					<td><Localized label="SR6.Combat.DefenseRating" />: TODO</td>
				</tr>
			</table>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.matrix-action-test-prompt {
	font-size: 12px;
	.amps {
		.amps-title {
			.amp-count {
				flex: 2;
				margin-left: auto;
				font-weight: bold;
				color: white;
			}
		}

		.amps-table {
			.amp-actions {
				text-align: center;
			}
			.amp-number {
				width: 3em;
				text-align: center;
				font-weight: bold;
			}
			.amp-title {
				white-space: nowrap;
				padding-right: 1em;
			}
			.amp-description {
			}
		}
	}
}
</style>
