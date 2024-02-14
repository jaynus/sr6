<script lang="ts" setup>
import { EnumAttribute } from '@/actor/data';
import { computed, inject, toRaw } from 'vue';
import CharacterDataModel from '@/actor/data/CharacterDataModel';
import { ActorSheetContext, RootContext } from '@/vue/SheetContext';

import AttributeTest from '@/test/AttributeTest';

const context = inject<ActorSheetContext<CharacterDataModel>>(RootContext)!;
const system = computed(() => context.data.actor.systemData);

async function roll(attribute: EnumAttribute) {
	await new AttributeTest({ actor: toRaw(context.data.actor), data: { attribute } }).execute();
}
</script>

<template>
	<div class="attributes">
		<div class="attribute" augmented-ui="b-clip-x exe">
			<p>Body</p>
			<span>
				{{ system.attributes.body.value }}<br />
				<a @click="roll(EnumAttribute.body)"><i class="roll-button">&nbsp;&nbsp;&nbsp;&nbsp;</i></a>
			</span>
			<div class="field">
				<label>Base</label>
				<input type="number" name="system.attributes.body.base" :value="system.attributes.body.base" />
			</div>
			<div class="field">
				<label>Mod</label>
				<input type="number" name="system.attributes.body.mod" :value="system.attributes.body.mod" />
			</div>
		</div>
		<div class="attribute" augmented-ui="b-clip-x exe">
			<p>Agility</p>
			<span>
				{{ system.attributes.agility.value }}<br />
				<a @click="roll(EnumAttribute.agility)"><i class="roll-button">&nbsp;&nbsp;&nbsp;&nbsp;</i></a>
			</span>
			<div class="field">
				<label>Base</label>
				<input type="number" name="system.attributes.agility.base" :value="system.attributes.agility.base" />
			</div>
			<div class="field">
				<label>Mod</label>
				<input type="number" name="system.attributes.agility.mod" :value="system.attributes.agility.mod" />
			</div>
		</div>
		<div class="attribute" augmented-ui="b-clip-x exe">
			<p>Reaction</p>
			<span
				>{{ system.attributes.reaction.value }}<br />
				<a @click="roll(EnumAttribute.reaction)"><i class="roll-button">&nbsp;&nbsp;&nbsp;&nbsp;</i></a>
			</span>
			<div class="field">
				<label>Base</label>
				<input type="number" name="system.attributes.reaction.base" :value="system.attributes.reaction.base" />
			</div>
			<div class="field">
				<label>Mod</label>
				<input type="number" name="system.attributes.reaction.mod" :value="system.attributes.reaction.mod" />
			</div>
		</div>
		<div class="attribute" augmented-ui="b-clip-x exe">
			<p>Strength</p>
			<span
				>{{ system.attributes.strength.value }}<br />
				<a @click="roll(EnumAttribute.strength)"><i class="roll-button">&nbsp;&nbsp;&nbsp;&nbsp;</i></a>
			</span>
			<div class="field">
				<label>Base</label>
				<input type="number" name="system.attributes.strength.base" :value="system.attributes.strength.base" />
			</div>
			<div class="field">
				<label>Mod</label>
				<input type="number" name="system.attributes.strength.mod" :value="system.attributes.strength.mod" />
			</div>
		</div>
		<div class="attribute" augmented-ui="b-clip-x exe">
			<p>Willpower</p>
			<span
				>{{ system.attributes.willpower.value }}<br />
				<a @click="roll(EnumAttribute.willpower)"><i class="roll-button">&nbsp;&nbsp;&nbsp;&nbsp;</i></a>
			</span>
			<div class="field">
				<label>Base</label>
				<input
					type="number"
					name="system.attributes.willpower.base"
					:value="system.attributes.willpower.base"
				/>
			</div>
			<div class="field">
				<label>Mod</label>
				<input type="number" name="system.attributes.willpower.mod" :value="system.attributes.willpower.mod" />
			</div>
		</div>
		<div class="attribute" augmented-ui="b-clip-x exe">
			<p>Logic</p>
			<span
				>{{ system.attributes.logic.value }}<br />
				<a @click="roll(EnumAttribute.logic)"><i class="roll-button">&nbsp;&nbsp;&nbsp;&nbsp;</i></a></span
			>
			<div class="field">
				<label>Base</label>
				<input type="number" name="system.attributes.logic.base" :value="system.attributes.logic.base" />
			</div>
			<div class="field">
				<label>Mod</label>
				<input type="number" name="system.attributes.logic.mod" :value="system.attributes.logic.mod" />
			</div>
		</div>
		<div class="attribute" augmented-ui="b-clip-x exe">
			<p>Intuition</p>
			<span
				>{{ system.attributes.intuition.value }}<br />
				<a @click="roll(EnumAttribute.intuition)"><i class="roll-button">&nbsp;&nbsp;&nbsp;&nbsp;</i></a></span
			>
			<div class="field">
				<label>Base</label>
				<input
					type="number"
					name="system.attributes.intuition.base"
					:value="system.attributes.intuition.base"
				/>
			</div>
			<div class="field">
				<label>Mod</label>
				<input type="number" name="system.attributes.intuition.mod" :value="system.attributes.intuition.mod" />
			</div>
		</div>
		<div class="attribute" augmented-ui="b-clip-x exe">
			<p>Charisma</p>
			<span
				>{{ system.attributes.charisma.value }}<br />
				<a @click="roll(EnumAttribute.charisma)"><i class="roll-button">&nbsp;&nbsp;&nbsp;&nbsp;</i></a></span
			>
			<div class="field">
				<label>Base</label>
				<input type="number" name="system.attributes.charisma.base" :value="system.attributes.charisma.base" />
			</div>
			<div class="field">
				<label>Mod</label>
				<input type="number" name="system.attributes.charisma.mod" :value="system.attributes.charisma.mod" />
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
@use '@/scss/vars/colors';
@use '@/scss/sheets';
@use '@/scss/attributes';
</style>
