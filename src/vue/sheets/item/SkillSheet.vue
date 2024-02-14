<script lang="ts" setup>
import { computed, inject } from 'vue';

import { ItemSheetContext, RootContext } from '@/vue/SheetContext';
import BasicItemSheet from '@/vue/sheets/item/BasicItemSheet.vue';
import Localized from '@/vue/components/Localized.vue';
import SkillDataModel from '@/item/data/feature/SkillDataModel';

const context = inject<ItemSheetContext<SkillDataModel>>(RootContext)!;
const system = computed(() => context.data.item.systemData);

const skillExpertise = computed({
	get() {
		if (context.data.item.systemData.expertise === null) {
			return 'null';
		}
		return context.data.item.systemData.expertise;
	},
	async set(newValue) {
		if (newValue === 'null') {
			context.data.item.systemData.expertise = null;
		} else {
			context.data.item.systemData.expertise = newValue;
		}
		await context.data.item.update({ ['system.expertise']: newValue });
	},
});

const skillSpecialization = computed({
	get() {
		if (context.data.item.systemData.specialization === null) {
			return 'null';
		}
		return context.data.item.systemData.specialization;
	},
	async set(newValue) {
		if (newValue === 'null') {
			context.data.item.systemData.specialization = null;
		} else {
			context.data.item.systemData.specialization = newValue;
		}
		await context.data.item.update({ ['system.specialization']: newValue });
	},
});
</script>

<template>
	<BasicItemSheet show-effects-tab>
		<template v-slot:data>
			<section class="data-grid">
				<div class="row">
					<label><Localized label="SR6.Labels.Attribute" /></label>
					<select name="system.attribute" :value="system.attribute">
						<option value="body"><Localized label="SR6.Attributes.body.Name" /></option>
						<option value="agility"><Localized label="SR6.Attributes.agility.Name" /></option>
						<option value="reaction"><Localized label="SR6.Attributes.reaction.Name" /></option>
						<option value="strength"><Localized label="SR6.Attributes.strength.Name" /></option>
						<option value="willpower"><Localized label="SR6.Attributes.willpower.Name" /></option>
						<option value="logic"><Localized label="SR6.Attributes.logic.Name" /></option>
						<option value="intuition"><Localized label="SR6.Attributes.intuition.Name" /></option>
						<option value="charisma"><Localized label="SR6.Attributes.charisma.Name" /></option>
						<option value="magic"><Localized label="SR6.Attributes.magic.Name" /></option>
						<option value="resonance"><Localized label="SR6.Attributes.resonance.Name" /></option>
					</select>
				</div>
				<div class="row">
					<label><Localized label="SR6.Labels.Specialization" /></label>
					<select v-model="skillSpecialization">
						<option value="null">—</option>
						<template v-for="spec in system.specializations" :key="spec">
							<option v-if="spec != system.expertise" v-bind:value="spec">{{ spec }}</option>
						</template>
					</select>
				</div>
				<div class="row">
					<label><Localized label="SR6.Labels.Expertise" /></label>
					<select v-model="skillExpertise">
						<option value="null">—</option>
						<template v-for="spec in system.specializations" :key="spec">
							<option v-if="spec != system.specialization" v-bind:value="spec">{{ spec }}</option>
						</template>
					</select>
				</div>
			</section>
		</template>
	</BasicItemSheet>
</template>
