<script lang="ts" setup>
import CharacterDataModel from '@/actor/data/CharacterDataModel';
import AsyncValue from '@/vue/components/combat/AsyncValue.vue';
import Localized from '@/vue/components/Localized.vue';
import SkillUseDataModel from '@/data/SkillUseDataModel';
import KnowledgeDataModel from '@/item/data/feature/KnowledgeDataModel';
import SkillDataModel from '@/item/data/feature/SkillDataModel';
import { TestType } from '@/test';
import { KnowledgeTest, MemoryTest } from '@/test/MemoryTests';

import SR6Item from '@/item/SR6Item';
import SkillTest from '@/test/SkillTest';
import { getEventValue, updateItem } from '@/vue/directives';
import { ActorSheetContext, RootContext } from '@/vue/SheetContext';
import { computed, inject, ref, toRaw } from 'vue';

import { Collapse } from 'vue-collapsed';
import { ComposureTest, JudgeIntentionsTest, LiftCarryTest } from '../../../../test/SimpleTests';

const context = inject<ActorSheetContext<CharacterDataModel>>(RootContext)!;
const _system = computed(() => context.data.actor.systemData);

const skills = ref(
	toRaw(context.data.actor)
		.items.filter((i) => i.type === 'skill')
		.sort((a, b) => a.name.localeCompare(b.name)) as SR6Item<SkillDataModel>[],
);

const knowledges = ref(
	toRaw(context.data.actor)
		.items.filter((i) => i.type === 'knowledge')
		.map((i) => i as SR6Item<KnowledgeDataModel>)
		.filter((i) => i.systemData.category === 'knowledge')
		.sort((a, b) => a.name.localeCompare(b.name)) as SR6Item<KnowledgeDataModel>[],
);
const languages = ref(
	toRaw(context.data.actor)
		.items.filter((i) => i.type === 'knowledge')
		.map((i) => i as SR6Item<KnowledgeDataModel>)
		.filter((i) => i.systemData.category === 'language')
		.sort((a, b) => a.name.localeCompare(b.name)) as SR6Item<KnowledgeDataModel>[],
);

const skillsVisible = ref(
	skills.value.map((skill) => {
		return {
			id: skill.id,
			visible: skill.systemData.specialization !== null,
		};
	}),
);
const isMaximized = ref(false);

async function updateSkill(skill: SR6Item<SkillDataModel>) {
	await toRaw(skill).update({ ['system']: skill.systemData });
}

async function selectSkillSpecialization(ev: Event, skill: SR6Item<SkillDataModel>) {
	skill.systemData.specialization = getEventValue(ev) as string;
	await updateSkill(skill);
}

async function selectSkillExpertise(ev: Event, skill: SR6Item<SkillDataModel>) {
	skill.systemData.expertise = getEventValue(ev) as string;
	await updateSkill(skill);
}

function maximize() {
	isMaximized.value = !isMaximized.value;
	skillsVisible.value.forEach((e) => (e.visible = isMaximized.value));
}

async function roll(skill: SR6Item<SkillDataModel>, specialization: null | string = null) {
	if (skill.systemData instanceof KnowledgeDataModel) {
		await new KnowledgeTest({ actor: toRaw(context.data.actor), item: skill, data: {} }).execute();
	} else {
		await new SkillTest({
			actor: toRaw(context.data.actor),
			data: {
				skillUse: new SkillUseDataModel(
					{ skill: skill.name, specialization, attribute: skill.systemData.attribute },
					{ parent: toRaw(context.data.actor) },
				),
			},
		}).execute();
	}
}

async function rollSimple(type: TestType) {
	switch (type) {
		case TestType.Composure:
			await new ComposureTest({ actor: toRaw(context.data.actor), data: {} }).execute();
			return;
		case TestType.JudgeIntentions:
			await new JudgeIntentionsTest({ actor: toRaw(context.data.actor), data: {} }).execute();
			return;
		case TestType.LiftCarry:
			await new LiftCarryTest({ actor: toRaw(context.data.actor), data: {} }).execute();
			return;
		case TestType.Memory:
			await new MemoryTest({ actor: toRaw(context.data.actor), data: {} }).execute();
			return;
	}

	throw 'Invalid simple test type';
}

async function getSkillPool(
	skill: SR6Item<SkillDataModel> | SR6Item<KnowledgeDataModel>,
	specialization: Maybe<string>,
): Promise<string> {
	const wtf = new SkillTest({
		actor: toRaw(context.data.actor),
		data: {
			skillUse: new SkillUseDataModel(
				{
					skill: skill.name,
					specialization,
					attribute: skill.systemData.attribute,
				},
				{ parent: toRaw(context.data.actor) },
			),
		},
	});

	return (await wtf.prepared()).data.pool!.toString();
}
</script>

<template>
	<section class="flexrow tab-skills">
		<div class="skills">
			<div class="section-title">Skills</div>
			<table class="field-table skills-table">
				<thead>
					<tr class="field-table">
						<td colspan="3" style="text-align: right; margin-left: auto; margin-right: 0">
							<a class="fa-solid fa-maximize" @click="maximize"></a>
						</td>
					</tr>
				</thead>
				<template v-for="skill in skills" :key="skill.id">
					<tr>
						<td style="width: 100%">
							<a
								@click="
									skillsVisible.find((v) => v.id == skill.id)!.visible = !skillsVisible.find(
										(v) => v.id == skill.id,
									)!.visible
								"
								><i class="fa-solid fa-down-from-line"></i> {{ skill.name }}</a
							>
						</td>
						<td>
							<input
								class="field-number"
								type="number"
								v-model="skill.systemData.points"
								@change="updateSkill(toRaw(skill) as unknown as SR6Item<SkillDataModel>)"
							/>
						</td>
						<td style="text-align: left">
							<AsyncValue
								:function="async () => await getSkillPool(skill as SR6Item<SkillDataModel>, undefined)"
							/>
						</td>
						<td>
							<a @click="roll(toRaw(skill) as unknown as SR6Item<SkillDataModel>)"
								><i class="roll-button">&nbsp;&nbsp;&nbsp;&nbsp;</i></a
							>
						</td>
					</tr>
					<tr class="skill-details">
						<td style="padding-left: 15px">
							<Collapse :when="skillsVisible.find((v) => v.id == skill.id)!.visible">
								<i class="fa-solid fa-arrow-right"></i>
								<select
									:value="skill.systemData.specialization"
									@change.prevent="
										(ev) =>
											selectSkillSpecialization(
												ev,
												toRaw(skill) as unknown as SR6Item<SkillDataModel>,
											)
									"
								>
									<option value="" :selected="!skill.systemData.specialization">-</option>
									<option v-for="special in skill.systemData.specializations" v-bind:key="special">
										{{ special }}
									</option>
								</select>
							</Collapse>
						</td>
						<td>
							<Collapse :when="skillsVisible.find((v) => v.id == skill.id)!.visible">
								<AsyncValue
									:function="
										async () =>
											await getSkillPool(
												skill as SR6Item<SkillDataModel>,
												skill.systemData.specialization,
											)
									"
								/>
							</Collapse>
						</td>
						<td style="text-align: left">
							<Collapse :when="skillsVisible.find((v) => v.id == skill.id)!.visible">{{
								new SkillTest({
									actor: toRaw(context.data.actor),
									data: {
										skillUse: new SkillUseDataModel(
											{
												skill: skill.name,
												specialization: skill.systemData.specialization,
												attribute: skill.systemData.attribute,
											},
											{ parent: toRaw(context.data.actor) },
										),
									},
								}).data.pool
							}}</Collapse>
						</td>
						<td>
							<Collapse :when="skillsVisible.find((v) => v.id == skill.id)!.visible"
								><a
									@click="
										roll(
											toRaw(skill) as unknown as SR6Item<SkillDataModel>,
											skill.systemData.specialization,
										)
									"
									><i class="roll-button">&nbsp;&nbsp;&nbsp;&nbsp;</i></a
								></Collapse
							>
						</td>
					</tr>
					<tr class="skill-details">
						<td style="padding-left: 15px">
							<Collapse :when="skillsVisible.find((v) => v.id == skill.id)!.visible">
								<i class="fa-solid fa-arrow-right"></i>
								<select
									:value="skill.systemData.expertise"
									@change.prevent="
										(ev) =>
											selectSkillExpertise(ev, toRaw(skill) as unknown as SR6Item<SkillDataModel>)
									"
									:disabled="skill.systemData.specialization == null"
								>
									<option value="" :selected="!skill.systemData.expertise">-</option>
									<option
										v-for="special in skill.systemData.specializations"
										v-bind:key="special"
										:disabled="special === skill.systemData.specialization"
									>
										{{ special }}
									</option>
								</select>
							</Collapse>
						</td>
						<td>
							<Collapse :when="skillsVisible.find((v) => v.id == skill.id)!.visible">
								<input
									class="field-number"
									type="number"
									:value="
										new SkillTest({
											actor: toRaw(context.data.actor),
											data: {
												skillUse: new SkillUseDataModel(
													{
														skill: skill.name,
														specialization: skill.systemData.expertise,
														attribute: skill.systemData.attribute,
													},
													{ parent: toRaw(context.data.actor) },
												),
											},
										}).data.pool
									"
									disabled
								/>
							</Collapse>
						</td>
						<td style="text-align: left">
							<Collapse :when="skillsVisible.find((v) => v.id == skill.id)!.visible"
								><AsyncValue
									:function="
										async () =>
											await getSkillPool(
												skill as SR6Item<SkillDataModel>,
												skill.systemData.expertise,
											)
									"
							/></Collapse>
						</td>
						<td>
							<Collapse :when="skillsVisible.find((v) => v.id == skill.id)!.visible"
								><a
									@click="
										roll(
											toRaw(skill) as unknown as SR6Item<SkillDataModel>,
											skill.systemData.expertise,
										)
									"
									><i class="roll-button">&nbsp;&nbsp;&nbsp;&nbsp;</i></a
								></Collapse
							>
						</td>
					</tr>
				</template>
			</table>
		</div>
		<div>
			<div class="other">
				<div class="section-title">Other Tests</div>
				<table class="field-table">
					<thead>
						<tr>
							<td style="width: 100%">Name</td>
							<td></td>
							<td></td>
						</tr>
					</thead>
					<tr>
						<td><Localized label="SR6.SimpleTests.Composure.Name" /></td>
						<td style="padding: 5px">
							<AsyncValue
								:function="
									async () => {
										const test = new ComposureTest({ actor: toRaw(context.data.actor), data: {} });
										return (await test.prepared()).data.pool?.toString() || '';
									}
								"
							/>
						</td>
						<td>
							<a @click="rollSimple(TestType.Composure)"
								><i class="roll-button">&nbsp;&nbsp;&nbsp;&nbsp;</i></a
							>
						</td>
					</tr>
					<tr>
						<td><Localized label="SR6.SimpleTests.JudgeIntentions.Name" /></td>
						<td style="padding: 5px">
							<AsyncValue
								:function="
									async () => {
										const test = new JudgeIntentionsTest({
											actor: toRaw(context.data.actor),
											data: {},
										});
										return (await test.prepared()).data.pool?.toString() || '';
									}
								"
							/>
						</td>
						<td>
							<a @click="rollSimple(TestType.JudgeIntentions)"
								><i class="roll-button">&nbsp;&nbsp;&nbsp;&nbsp;</i></a
							>
						</td>
					</tr>
					<tr>
						<td><Localized label="SR6.SimpleTests.LiftCarry.Name" /></td>
						<td style="padding: 5px">
							<AsyncValue
								:function="
									async () => {
										const test = new LiftCarryTest({ actor: toRaw(context.data.actor), data: {} });
										return (await test.prepared()).data.pool?.toString() || '';
									}
								"
							/>
						</td>
						<td>
							<a @click="rollSimple(TestType.LiftCarry)"
								><i class="roll-button">&nbsp;&nbsp;&nbsp;&nbsp;</i></a
							>
						</td>
					</tr>
					<tr>
						<td><Localized label="SR6.SimpleTests.Memory.Name" /></td>
						<td style="padding: 5px">
							<AsyncValue
								:function="
									async () => {
										const test = new MemoryTest({ actor: toRaw(context.data.actor), data: {} });
										return (await test.prepared()).data.pool?.toString() || '';
									}
								"
							/>
						</td>
						<td>
							<a @click="rollSimple(TestType.Memory)"
								><i class="roll-button">&nbsp;&nbsp;&nbsp;&nbsp;</i></a
							>
						</td>
					</tr>
				</table>
			</div>
			<div class="knowledge">
				<div class="section-title">Knowledge</div>
				<table class="field-table">
					<thead>
						<tr>
							<td>Name</td>
							<td></td>
							<td></td>
						</tr>
					</thead>
					<tr v-for="skill in knowledges" v-bind:key="skill.id">
						<td>
							<input
								type="text"
								:value="skill.name"
								@change="(ev) => updateItem(context.data.actor, skill.id, 'name', ev)"
							/>
						</td>
						<td>
							<AsyncValue
								:function="async () => await getSkillPool(skill as SR6Item<SkillDataModel>, undefined)"
							/>
						</td>
						<td>
							<a @click="roll(toRaw(skill) as unknown as SR6Item<SkillDataModel>)"
								><i class="roll-button">&nbsp;&nbsp;&nbsp;&nbsp;</i></a
							>
						</td>
					</tr>
				</table>
			</div>
			<div>
				<div class="languages">
					<div class="section-title">Languages</div>
					<table class="field-table">
						<thead>
							<tr>
								<td>Name</td>
								<td></td>
							</tr>
						</thead>
						<tr v-for="skill in languages" v-bind:key="skill.id">
							<td>
								<input
									type="text"
									:value="skill.name"
									@change="(ev) => updateItem(context.data.actor, skill.id, 'name', ev)"
								/>
							</td>
							<td>
								<AsyncValue
									:function="
										async () => await getSkillPool(skill as SR6Item<SkillDataModel>, undefined)
									"
								/>
							</td>
							<td>
								<a @click="roll(toRaw(skill) as unknown as SR6Item<SkillDataModel>)"
									><i class="roll-button">&nbsp;&nbsp;&nbsp;&nbsp;</i></a
								>
							</td>
						</tr>
					</table>
				</div>
			</div>
		</div>
	</section>
</template>

<style lang="scss" scoped>
@use '@scss/vars/colors.scss';
@use '@scss/sheets.scss';

.tab-skills {
	.skills {
		@extend .section;
		width: 30%;

		.skills-table {
			align-self: start;
			border-collapse: collapse;
			margin: 0;
			padding: 0;

			.skill-details {
				font-size: 12px;
				white-space: nowrap;

				select {
					width: 90%;
				}
			}
		}
	}

	.knowledge {
		@extend .section;
		width: 97%;
	}
	.languages {
		@extend .knowledge;
	}
	.other {
		@extend .knowledge;
	}
}
</style>
