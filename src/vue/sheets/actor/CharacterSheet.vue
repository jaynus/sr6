<script lang="ts" setup>
import Localized from '@/vue/components/Localized.vue';
import CharacterMeta from '@/vue/sheets/actor/character/CharacterMeta.vue';

import BasicsTab from '@/vue/sheets/actor/character/BasicsTab.vue';
import GMTab from '@/vue/sheets/actor/character/GMTab.vue';
import SkillsTab from '@/vue/sheets/actor/character/SkillsTab.vue';
import InventoryTab from '@/vue/sheets/actor/character/InventoryTab.vue';
import CombatTab from '@/vue/sheets/actor/character/CombatTab.vue';
import MatrixTab from '@/vue/sheets/actor/character/MatrixTab.vue';
import MagicTab from '@/vue/sheets/actor/character/MagicTab.vue';
import PersonalTab from '@/vue/sheets/actor/character/PersonalTab.vue';
import EffectsTab from '@/vue/sheets/actor/character/EffectsTab.vue';
</script>

<template>
	<div class="character-sheet">
		<CharacterMeta />

		<section class="combat-stat-row"></section>

		<nav class="sheet-tabs" data-group="primary">
			<div class="spacer"></div>

			<a class="item" data-tab="basics"><Localized label="SR6.Tabs.Basics" /></a>
			<a class="item" data-tab="skills"><Localized label="SR6.Tabs.Skills" /></a>
			<a class="item" data-tab="inventory"><Localized label="SR6.Tabs.Inventory" /></a>
			<a class="item" data-tab="combat"><Localized label="SR6.Tabs.Combat" /></a>
			<a class="item" data-tab="matrix"><Localized label="SR6.Tabs.Matrix" /></a>
			<a class="item" data-tab="magic"><Localized label="SR6.Tabs.Magic" /></a>
			<a class="item" data-tab="personal"><Localized label="SR6.Tabs.Personal" /></a>
			<a class="item" data-tab="effects"><Localized label="SR6.Tabs.Effects" /></a>
			<a class="item" data-tab="gm"><Localized label="SR6.Tabs.GM" /></a>
			<a></a>
			<div class="spacer"></div>
		</nav>

		<section class="sheet-body">
			<div class="tab" data-tab="basics">
				<Suspense><BasicsTab /></Suspense>
			</div>
			<div class="tab" data-tab="skills">
				<Suspense><SkillsTab /></Suspense>
			</div>
			<div class="tab" data-tab="inventory">
				<Suspense><InventoryTab /></Suspense>
			</div>
			<div class="tab" data-tab="combat">
				<Suspense><CombatTab /></Suspense>
			</div>
			<div class="tab" data-tab="matrix">
				<Suspense><MatrixTab /></Suspense>
			</div>
			<div class="tab" data-tab="magic">
				<Suspense><MagicTab /></Suspense>
			</div>
			<div class="tab" data-tab="personal">
				<Suspense><PersonalTab /></Suspense>
			</div>
			<div class="tab" data-tab="effects">
				<Suspense><EffectsTab /></Suspense>
			</div>
			<div class="tab" data-tab="gm">
				<Suspense><GMTab /></Suspense>
			</div>
		</section>
	</div>
</template>

<style lang="scss" scoped>
.character-sheet {
	width: 100%;
	height: 100%;

	display: grid;
	// Meta, Combat Stats, Tabs, tab content
	grid-template-rows: repeat(3, auto) 1fr;
	gap: 0.5em;
}

// Container for the character's secondary combat stats (wounds, strain, etc.)
.combat-stat-row {
	// By default, evenly space the items across the full sheet width.
	display: flex;
	gap: 1em;
	align-items: center;
	justify-content: space-around;

	// When the sheet is wider than 700px, simply center the stat boxes.
	@container sheet (min-width: 700px) {
		display: flex;
		justify-content: center;

		.combat-stat {
			width: 165px;
		}
	}
}
</style>
