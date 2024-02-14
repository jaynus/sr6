/* eslint-disable vue/multi-word-component-names */
<script lang="ts" setup>
import SkillDataModel from '@/item/data/feature/SkillDataModel';
import SR6Item from '@/item/SR6Item';
import SkillTest from '@/test/SkillTest';
import { toRaw, ref } from 'vue';

const emit = defineEmits<{
	(e: 'setText', value: { title: string; hint: string }): void;
}>();

const props = defineProps<{
	test: SkillTest;
}>();

const skill = ref<SR6Item<SkillDataModel>>(toRaw(props.test.actor).skill(props.test.data.skillUse.skill)!);
const skillName = ref<string>(props.test.data.skillUse.specialization || props.test.data.skillUse.skill);

emit('setText', {
	title: `Skill (${skillName.value})`,
	hint: ``,
});
</script>

<template>
	<div class="flexrow chat-attribute-test">
		<div class="attack-details">{{ skill.systemData.description }}</div>
	</div>
</template>

<style lang="scss" scoped>
.chat-attribute-test {
	font-size: 12px;

	.attack-details {
		padding-top: 5px;
		padding-bottom: 5px;
		min-width: 100%;
	}
}
</style>
