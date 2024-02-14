import SR6Actor from '@/actor/SR6Actor';
import InitiativeRoll from '@/roll/InitiativeRoll';
import { ITest } from 'src/test';
import BaseTest, { BaseTestData, TestSourceData } from '@/test/BaseTest';
import SR6Roll from '@/roll/SR6Roll';
import { SR6Token } from '@/token/SR6Token';
import * as util from '@/util';
import VueChatMessage from '@/chat/vue/ChatMessage.vue';

import { App, createApp, reactive, UnwrapNestedRefs } from 'vue';

export const ChatContext = Symbol('Chat Root Context');

export class ChatMessageContext {
	test?: ITest;
	roll?: SR6Roll;
	message: SR6ChatMessage;

	get actor(): SR6Actor | null {
		return this.message.speaker.actor ? game.actors.get(this.message.speaker.actor) : null;
	}

	get scene(): Scene | null {
		return this.message.speaker.scene ? (game.scenes.get(this.message.speaker.scene) as Scene | null) : null;
	}

	get token(): SR6Token | null {
		return this.message.speaker.token ? (canvas.tokens.get(this.message.speaker.token) as SR6Token | null) : null;
	}

	constructor(message: SR6ChatMessage) {
		this.message = message;
	}
}

export type ChatMessageFlags = {
	sr6?: {
		testData?: TestSourceData<BaseTestData>;
	};
};

export class SR6ChatMessage extends ChatMessage<SR6Actor> {
	declare flags: ChatMessageFlags;

	form: HTMLFormElement;
	vueApp: App;
	vueContext: UnwrapNestedRefs<ChatMessageContext>;

	mounted: boolean = false;

	constructor(data: PreCreate<foundry.data.ChatMessageSource>, context?: DocumentConstructionContext<ChatMessage>) {
		super(data, context);

		this.vueContext = reactive(new ChatMessageContext(this));

		const form = document.createElement('form');

		form.className = `vue-app`;
		form.setAttribute('autocomplete', 'off');

		this.form = form;
		this.vueApp = createApp(VueChatMessage);

		if (this.rolls.length > 0) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			if ((this.rolls[0] as any).class) {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				switch ((this.rolls[0] as any).class) {
					case 'InitiativeRoll': {
						this.vueContext.roll = InitiativeRoll.fromData(this.rolls[0] as unknown as RollJSON) as SR6Roll;
						break;
					}
					case 'SR6Roll': {
						this.vueContext.roll = SR6Roll.fromData(this.rolls[0] as unknown as RollJSON) as SR6Roll;
						break;
					}
				}
			} else {
				this.vueContext.roll = this.rolls[0] as SR6Roll;
			}
		}
	}

	override async getHTML(): Promise<JQuery> {
		const html = await super.getHTML();

		if (this.flags?.sr6?.testData) {
			const testObj = BaseTest.fromData(this.flags!.sr6!.testData!);
			if (testObj.ok) {
				this.vueContext.test = testObj.val;
			}
		}

		if (!this.mounted) {
			this.mounted = true;
			await util.waitForCanvasTokens();
			this.vueApp.provide(ChatContext, this.vueContext);
			this.vueApp.mount(this.form);
		}

		if (this.vueContext.test?.roll?.is_critical_glitch) {
			html.css({ borderColor: 'rgb(215, 14, 233)' });
		} else if (this.vueContext.test?.roll?.is_glitch) {
			html.css({ borderColor: 'rgb(194, 76, 29)' });
		} else {
			if (this.vueContext.test?.roll?.threshold !== undefined) {
				if (this.vueContext.test?.roll?.success) {
					html.css({ borderColor: 'rgba(38, 194, 129, 1.0)' });
				} else {
					html.css({ borderColor: '#90231e' });
				}
			}
		}

		html.find('.message-content').empty().append(this.form);

		return html;
	}
}
