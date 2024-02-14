/* eslint-disable vue/multi-word-component-names */
<script lang="ts" setup>
import AttributeTest from '@/test/AttributeTest';
import { ref } from 'vue';

const emit = defineEmits<{
	(e: 'setText', value: { title: string; hint: string }): void;
}>();

const props = defineProps<{
	test: AttributeTest;
}>();

const attributeName = ref(game.i18n.localize(`SR6.Attributes.${props.test.data.attribute}.Name`));
const attributeDescription = ref(game.i18n.localize(`SR6.Attributes.${props.test.data.attribute}.Description`));

emit('setText', {
	title: `Attribute (${attributeName.value})`,
	hint: ``,
});
</script>

<template>
	<div class="flexrow chat-attribute-test">
		<div class="attack-details">{{ attributeDescription }}</div>
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
