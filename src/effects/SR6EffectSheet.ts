/**
 *
 * @author jaynus
 * @file ActiveEffect configuration sheet
 */

import './SR6EffectSheet.scss';

export default class SR6EffectSheet extends ActiveEffectConfig {
	static override get defaultOptions(): ActiveEffectConfigOptions {
		return {
			...super.defaultOptions,
			classes: ['sr6', 'sheet'],
			width: 500,
			height: 400,
			tabs: [
				{
					navSelector: '.sheet-tabs',
					contentSelector: '.sheet-body',
					initial: 'description',
				},
			],
		};
	}

	override get template(): string {
		return 'systems/sr6/templates/sheets/effect-config.hbs';
	}

	override activateListeners(html: JQuery): void {
		super.activateListeners(html);

		if (this.isEditable) {
			// Foundry v10 and v11 bind this functionality differently so instead we override that behavior with our own.
			html.find('img[data-edit]').off('click');
			html.find('img[data-edit]').on('click', this._onEditImage.bind(this));
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	protected async _onEditImage(event: Event): Promise<any> {
		const fp = new FilePicker({
			type: 'image',
			current: this.object.icon,
			callback: async (path: string) => {
				(<HTMLImageElement>event.currentTarget).src = path;
				await this._onSubmit(event, { preventClose: true });
			},
			top: (this.position.top ?? 0) + 40,
			left: (this.position.left ?? 0) + 10,
		});

		return await fp.browse();
	}
}
