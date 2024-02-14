<script lang="ts" setup>
import { computedAsync } from '@vueuse/core';
import { Ref } from 'vue';

import { getCoreSkills } from '@/item/data';
import SR6Item from '@/item/SR6Item';
import SkillDataModel from '@/item/data/feature/SkillDataModel';
import SkillUseDataModel from '@/data/SkillUseDataModel';
import Localized from '@/vue/components/Localized.vue';

const props = defineProps<{
	skillUse: SkillUseDataModel;
	skill_category: undefined | string;
}>();

const skills: Ref<SR6Item<SkillDataModel>[]> = computedAsync(async () => {
	let skills = await getCoreSkills();
	skills.filter((skill) => skill.system.category === props.skill_category);
	return skills;
});

function _getSkill(name: string): undefined | SR6Item<SkillDataModel> {
	return skills.value.find((s) => s.name === name);
}
</script>

<template>
	<label><Localized label="SR6.Labels.Attribute" /></label>
	<select name="system.skillUse.attribute" :value="skillUse.attribute"></select>

	<label><Localized label="SR6.Labels.Skill" /></label>
	<select name="system.skillUse.skill" :value="skillUse.skill">
		<option v-for="skill in skills" :key="skill.id">{{ skill.name }}</option>
	</select>

	<label><Localized label="SR6.Labels.Specialization" /></label>
	<select name="system.skillUse.specialization" :value="skillUse.specialization">
		<!--<option v-if="skillUse.skill != null" v-for="special in getSkill(skillUse.skill)?.systemData.specializations">{{ special }}</option>-->
	</select>
</template>
