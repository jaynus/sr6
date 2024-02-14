import { ContextBase } from '@/vue/SheetContext';
import VueSheet from '@/vue/VueSheet';
import { Component } from 'vue';

export interface DialogPromptContext<TResult, TData> extends ContextBase {
	app: DialogPrompt<TResult, TData>;
	data: TData;
	resolvePromise: (value: Maybe<TResult>) => void;
}
export class DialogPrompt<TResult, TData> extends VueSheet(Application) {
	data: TData;
	_vueComponent: Component;
	#resolvePromise?: (value: Maybe<TResult>) => void;

	static async prompt<TResult, TData = null>(
		vueComponent: Component,
		data: TData,
		options?: Record<string, unknown>,
	): Promise<Maybe<TResult>> {
		const prompt = new DialogPrompt<TResult, TData>(data, vueComponent, {
			...DialogPrompt.defaultOptions,
			...options,
		});
		await prompt.render(true);

		return new Promise<Maybe<TResult>>((resolve) => {
			prompt.#resolvePromise = resolve;
		});
	}

	constructor(data: TData, vueComponent: Component, options?: ApplicationOptions) {
		super(options);
		this.data = data;
		this._vueComponent = vueComponent;
	}

	override async close(options: {} = {}): Promise<void> {
		return super.close(options);
	}

	async getVueContext(): Promise<DialogPromptContext<TResult, TData>> {
		return {
			app: this,
			data: this.data,
			resolvePromise: async (data) => {
				this.#resolvePromise?.(data);
				this.#resolvePromise = undefined;

				await this.close();
			},
		};
	}

	protected override async _renderOuter(options: RenderOptions): Promise<JQuery> {
		const html = await super._renderOuter(options);
		const app = html[0];

		app.setAttribute('role', 'dialog');
		app.setAttribute('aria-modal', 'true');

		return html;
	}

	get vueComponent(): Component {
		return this._vueComponent;
	}

	static override get defaultOptions(): ApplicationOptions {
		return foundry.utils.mergeObject(super.defaultOptions, {
			focus: true,
			classes: ['dialog'],
			width: 500,
			height: 300,
			minimizable: false,
		});
	}
}

export class ConfirmationPrompt<TData = null> extends DialogPrompt<boolean, TData> {
	static override get defaultOptions(): ApplicationOptions {
		return foundry.utils.mergeObject(super.defaultOptions, {
			height: 100,
		});
	}

	constructor(data: TData, vueComponent: Component, options?: ApplicationOptions) {
		super(data, vueComponent, options);
		this.data = data;
		this._vueComponent = vueComponent;
	}
}
