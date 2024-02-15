<script lang="ts" setup>
import { ImportAction, ImportPromptContext } from '@/app/ImportPrompt';
import { RootContext } from '@/vue/SheetContext';
import { inject, ref, toRaw } from 'vue';

const context = inject<ImportPromptContext>(RootContext)!;

const path = ref<Maybe<string>>(context.app.actor?.systemData.source);

async function click() {
	await new FilePicker({
		callback: async (newPath: string) => {
			path.value = newPath;
		},
	}).render(true);
}

async function doImport() {
	if (path.value) {
		await toRaw(context.app)._onImportGenesisActor(toRaw(path.value));
	}
}

function setGlobal(action: ImportAction) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	Object.keys(context.app.settings).forEach((key) => ((context.app.settings as any)[key] = action));
}
</script>

<template>
	<div class="flexrow">
		<div class="section-head">{{ context.app.actor?.name }}</div>
		<div class="section flexcol" style="width: auto">
			<div class="section-title">Global</div>
			<input type="button" value="Skip" @click="setGlobal(ImportAction.Skip)" />
			<input type="button" value="Replace" @click="setGlobal(ImportAction.Replace)" />
			<input type="button" value="No Replace" @click="setGlobal(ImportAction.NoReplace)" />
			<input type="button" value="Merge" @click="setGlobal(ImportAction.Merge)" />
			<input type="button" value="Fresh" @click="setGlobal(ImportAction.Fresh)" />
		</div>
		<div class="section" style="width: auto" v-for="key in Object.keys(context.app.settings)" v-bind:key="key">
			<div class="section-title">{{ key }}</div>
			<div style="white-space: nowrap">
				Skip
				<label class="switch">
					<input
						:name="key"
						type="radio"
						@click="(context.app.settings as any)[key] = ImportAction.Skip"
						:checked="(context.app.settings as any)[key] === ImportAction.Skip"
					/>
					<span class="slider round"></span>
				</label>
			</div>
			<div style="white-space: nowrap">
				Replace
				<label class="switch">
					<input
						:name="key"
						type="radio"
						@click="(context.app.settings as any)[key] = ImportAction.Replace"
						:checked="(context.app.settings as any)[key] === ImportAction.Replace"
					/>
					<span class="slider round"></span>
				</label>
			</div>
			<div style="white-space: nowrap">
				NoReplace
				<label class="switch">
					<input
						:name="key"
						type="radio"
						@click="(context.app.settings as any)[key] = ImportAction.NoReplace"
						:checked="(context.app.settings as any)[key] === ImportAction.NoReplace"
					/>
					<span class="slider round"></span>
				</label>
			</div>
			<div style="white-space: nowrap">
				Merge
				<label class="switch">
					<input
						:name="key"
						type="radio"
						@click="(context.app.settings as any)[key] = ImportAction.Merge"
						:checked="(context.app.settings as any)[key] === ImportAction.Merge"
					/>
					<span class="slider round"></span>
				</label>
			</div>
			<div style="white-space: nowrap">
				Fresh
				<label class="switch">
					<input
						:name="key"
						type="radio"
						@click="(context.app.settings as any)[key] = ImportAction.Fresh"
						:checked="(context.app.settings as any)[key] === ImportAction.Fresh"
					/>
					<span class="slider round"></span>
				</label>
			</div>
		</div>
	</div>
	<div>
		SR6 JSON: <input id="pick-file" type="button" value="Select File" @click.prevent="click()" />
		<input type="text" v-model="path" />
	</div>
	<input class="dialog-button line" type="button" value="Import" @click.prevent="doImport" />
</template>

<style lang="scss" scoped></style>
