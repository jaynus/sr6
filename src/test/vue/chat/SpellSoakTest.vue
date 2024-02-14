/* eslint-disable vue/multi-word-component-names */
<script lang="ts" setup>
import { SpellSoakTest } from '@/test/SpellTests';
import Localized from '@/vue/components/Localized.vue';
import { Collapse } from 'vue-collapsed';
import { toRaw, ref } from 'vue';

const emit = defineEmits<{
	(e: 'setText', value: { title: string; hint: string }): void;
}>();

defineProps<{
	test: SpellSoakTest;
}>();

const visibility = ref({
	description: {
		damage: false,
	},
});

emit('setText', {
	title: `Soak Matrix Damage`,
	hint: ``,
});
</script>

<template>
	<div class="flexrow chat-spell-soak-test">
		<div class="attack-details">
			<div class="damage">
				<a
					@mouseenter.prevent="visibility.description.damage = true"
					@mouseleave.prevent="visibility.description.damage = false"
				>
					<Localized label="SR6.Combat.Damage" />:

					<i class="dv">{{ toRaw(test).damage }}</i>
					&nbsp;
				</a>
				<Collapse class="formula" :when="visibility.description.damage">
					{{ toRaw(test).baseDamage }} - {{ test.roll?.hits }} = {{ toRaw(test).damage }}
				</Collapse>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.chat-spell-soak-test {
	font-size: 12px;

	.attack-details {
		padding-top: 5px;
		padding-bottom: 5px;
		min-width: 100%;
	}
}
</style>
