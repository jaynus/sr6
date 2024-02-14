<script lang="ts" setup>
import * as images from '@/vue/images';
import MonitorView from '@/vue/views/MonitorView.vue';
import { MonitorType } from '@/actor/data/MonitorsDataModel';
import { inject, toRaw, computed } from 'vue';

import CharacterDataModel from '@/actor/data/CharacterDataModel';
import { getEventValue, vLocalize } from '@/vue/directives';
import { ActorSheetContext, RootContext } from '@/vue/SheetContext';
import Localized from '@/vue/components/Localized.vue';

const context = inject<ActorSheetContext<CharacterDataModel>>(RootContext)!;
const system = computed(() => toRaw(context.data.actor).systemData);

async function setDamage(monitor: MonitorType, amount: number) {
	if (toRaw(system.value).monitors.get(monitor).damage === amount) {
		await toRaw(system.value).monitors.setDamage(monitor, 0);
	} else {
		await toRaw(system.value).monitors.setDamage(monitor, amount);
	}
}

async function setEdge(ev: Event) {
	const actor = toRaw(context.data.actor);

	let value = getEventValue(ev)!;
	if (typeof value !== 'number') {
		console.error('Didnt get a number for the event?');
		return;
	}
	if (value > actor.systemData.monitors.edge.max) {
		value = actor.systemData.monitors.edge.max;
	}

	await actor.update({ ['system.monitors.edge.damage']: actor.systemData.monitors.edge.max - (value as number) });
}
</script>

<template>
	<header class="character-meta">
		<div class="section">
			<div class="section-title">
				<div class="title">
					<Localized label="Character" /><br /><input
						type="text"
						name="name"
						:value="context.data.actor.name"
						v-localize:placeholder="'SR6.Labels.CharacterName'"
						style="width: 10em"
					/>
				</div>
				<div class="section" style="display: flex; flex-flow: row nowrap">
					<div class="text-atop">
						<img :src="images.karma" alt="" />
						<label class="text-atop-value"
							><input type="number" name="system.karma" :value="system.karma"
						/></label>
					</div>
					<div class="text-atop">
						<img :src="images.edge" alt="" />
						<label class="text-atop-value" style="white-space: nowrap"
							><input
								type="number"
								@change="setEdge"
								:value="system.monitors.edge.value"
								style="width: 1em" />/<input
								type="number"
								name="system.attributes.edge.base"
								:value="system.attributes.edge.base"
								style="width: 1em"
						/></label>
					</div>
					<div class="text-atop">
						<img :src="images.yen" alt="" />
						<label class="text-atop-value">{{ system.totalNuyen }}</label>
					</div>
				</div>
			</div>
			<div class="section" style="align-self: start; width: 95%">
				<MonitorView
					:monitor="system.monitors.physical"
					@setDamage="(idx) => setDamage(MonitorType.Physical, idx)"
				/>
				<MonitorView
					v-if="system.monitors.physical.value <= 0"
					:monitor="system.monitors.overflow"
					icon="/icons/svg/skull.svg"
					:showModifiers="false"
					@setDamage="(idx) => setDamage(MonitorType.Overflow, idx)"
				/>
				<MonitorView
					:monitor="system.monitors.stun"
					icon="/systems/sr6/assets/brain.webp"
					@setDamage="(idx) => setDamage(MonitorType.Stun, idx)"
				/>
			</div>
		</div>
		<img :src="context.data.actor.img" data-edit="img" :alt="context.data.actor.name" />
	</header>
</template>

<style lang="scss" scoped>
@use '@scss/mixins/reset';
@use '@scss/vars/colors';
@use '@scss/icons';

// Container for the character's meta information; name, archetype, career, etc. as well as the Actor's image
.character-meta {
	display: grid;
	grid-template-columns: 1fr min(110px, 20%);
	gap: 1rem;
	margin-bottom: 0.5em;

	@include reset.input;

	// Actor's image
	img {
		border: 1px solid colors.$gold;
		background: transparentize(colors.$gold, 0.5);
		border-radius: 1em;
	}
}
</style>
