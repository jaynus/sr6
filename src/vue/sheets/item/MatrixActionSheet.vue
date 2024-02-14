<script lang="ts" setup>
import { computed, inject } from 'vue';

import { ItemSheetContext, RootContext } from '@/vue/SheetContext';
import BasicItemSheet from '@/vue/sheets/item/BasicItemSheet.vue';
import Localized from '@/vue/components/Localized.vue';
import SkillUse from '@/vue/components/SkillUse.vue';
import MatrixActionDataModel from '@/item/data/action/MatrixActionDataModel';

const context = inject<ItemSheetContext<MatrixActionDataModel>>(RootContext)!;
const system = computed(() => context.data.item.systemData);
</script>

<template>
	<BasicItemSheet show-effects-tab>
		<template v-slot:data>
			<section class="data-grid">
				<div class="row">
					<label><Localized label="SR6.Labels.Type" /></label>
					<select name="system.type" :value="system.type">
						<option value="decker"><Localized label="SR6.Matrix.Decker" /></option>
						<option value="ic"><Localized label="SR6.Matrix.IC" /></option>
					</select>
				</div>
				<div class="row" v-if="system.skillUse">
					<SkillUse :skillUse="system.skillUse!" skill_category="matrix" />
				</div>
				<div class="row">
					<h4><Localized label="SR6.Matrix.Usage" /></h4>

					<label><Localized label="SR6.Labels.Illegal" /></label>
					<input type="checkbox" name="system.limits.illegal" :checked="system.limits.illegal" />

					<label><Localized label="SR6.Enums.MatrixAccessLevel" /></label>
					<select name="system.limits.access_level" :value="system.limits.access_level">
						<option value="outsider"><Localized label="SR6.Enums.MatrixAccessLevels.Outsider" /></option>
						<option value="user"><Localized label="SR6.Enums.MatrixAccessLevels.User" /></option>
						<option value="admin"><Localized label="SR6.Enums.MatrixAccessLevels.Admin" /></option>
					</select>

					<label><Localized label="SR6.Enums.ActivationType" /></label>
					<select name="system.activation.type" :value="system.activation.type">
						<option value="major"><Localized label="SR6.Enums.ActivationTypes.Major" /></option>
						<option value="minor"><Localized label="SR6.Enums.ActivationTypes.Minor" /></option>
						<option value="passive"><Localized label="SR6.Enums.ActivationTypes.Passive" /></option>
					</select>

					<label><Localized label="SR6.Enums.ActivationPeriod" /></label>
					<select name="system.activation.type" :value="system.activation.period">
						<option value="any"><Localized label="SR6.Enums.ActivationPeriods.Any" /></option>
						<option value="initiative"><Localized label="SR6.Enums.ActivationPeriods.Initiative" /></option>
						<option value="pre"><Localized label="SR6.Enums.ActivationPeriods.PreRoll" /></option>
						<option value="post"><Localized label="SR6.Enums.ActivationPeriods.PostRoll" /></option>
					</select>
				</div>
				<div class="row">
					<h4><Localized label="SR6.Labels.Formulas" /></h4>

					<label><Localized label="SR6.Labels.Attack" /></label>
					<input type="text" name="system.formulas.attack" :value="system.formulas.attack" />
					<label><Localized label="SR6.Labels.Defend" /></label>
					<input type="text" name="system.formulas.defend" :value="system.formulas.defend" />
					<label><Localized label="SR6.Labels.Damage" /></label>
					<input type="text" name="system.formulas.damage" :value="system.formulas.damage" />
					<label><Localized label="SR6.Labels.Soak" /></label>
					<input type="text" name="system.formulas.soak" :value="system.formulas.soak" />
				</div>
			</section>
		</template>
	</BasicItemSheet>
</template>
