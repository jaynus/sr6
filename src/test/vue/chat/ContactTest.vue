/* eslint-disable vue/multi-word-component-names */
<script lang="ts" setup>
import SR6Roll from '@/roll/vue/SR6Roll.vue';
import ContactTest from '@/test/ContactTest';

const props = defineProps<{
	test: ContactTest;
}>();

const emit = defineEmits<{
	(e: 'setText', value: { title: string; hint: string }): void;
}>();

emit('setText', {
	title: `Contact (${props.test.contact.name})`,
	hint: ``,
});
</script>

<template>
	<div class="flexrow chat-attribute-test">
		<div class="attack-details">
			<hr />
			Connection Roll
			<SR6Roll v-if="test.connectionRoll" :roll="test.connectionRoll!" />
		</div>
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
