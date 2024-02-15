<script lang="ts" setup>
import SR6Roll from '@/roll/SR6Roll';
import FloatCollapse from '@/vue/components/FloatCollapse.vue';
import Localized from '@/vue/components/Localized.vue';
import { ref } from 'vue';

const emit = defineEmits<{
	(e: 'setText', value: { title: string; hint: string }): void;
}>();

const props = defineProps<{
	roll: SR6Roll;
}>();

const expandDice = ref(false);

emit('setText', {
	title: props.roll?.options?.initiativeRoll ? 'Initiative' : 'Roll',
	hint: ``,
});
</script>

<template>
	<template v-if="roll?.options?.initiativeRoll">
		<div class="roll-formula">{{ roll?.formula }}</div>
		<div style="text-align: center; font-weight: bold">{{ roll?.total }}</div>
	</template>
	<template v-else>
		<section
			class="flexrow roll-information"
			@mouseenter.prevent="expandDice = true"
			@mouseleave.prevent="expandDice = false"
		>
			<div class="roll-formula">{{ props.roll.pool }}d6</div>
			<div class="hits">
				<i class="bold">{{ props.roll.hits }}</i> hits
			</div>

			<!-- Glitch/Critical Glitch -->

			<div class="glitches" v-if="props.roll.threshold != undefined">
				<div class="critical-glitch" v-if="props.roll?.is_critical_glitch">
					<Localized label="SR6.Labels.CriticalGlitch" />
				</div>
				<div class="glitch" v-else-if="props.roll?.is_glitch">
					<Localized label="SR6.Labels.Glitch" />
				</div>
			</div>

			<!-- Success/Fail -->
			<div class="result" v-if="props.roll.threshold != undefined">
				<div class="success" v-if="props.roll?.threshold && props.roll.success">
					<Localized label="SR6.Labels.Success" />
				</div>
				<div class="failure" v-else-if="!props.roll?.success">
					<Localized label="SR6.Labels.Failure" />
				</div>
			</div>
		</section>
		<div class="threshold" v-if="props.roll?.threshold">
			Threshold: <i class="bold">{{ props.roll.threshold }}</i>
		</div>

		<!-- Dice -->
		<FloatCollapse v-else :when="expandDice" class="dice-details">
			<i class="dice" v-for="num in props.roll.sides" v-bind:key="num" :data-die="num">&nbsp; </i>
		</FloatCollapse>
	</template>
</template>

<style scoped></style>
