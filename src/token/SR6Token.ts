import BaseActorDataModel from '@/actor/data/BaseActorDataModel';
import SR6Actor from '@/actor/SR6Actor';

export class SR6TokenDocument extends TokenDocument {}

export class SR6Token<TDocument extends TokenDocument = SR6TokenDocument> extends Token<TDocument> {
	constructor(document: TDocument) {
		super(document);
	}

	get systemActor(): null | SR6Actor<BaseActorDataModel> {
		return this.actor as SR6Actor<BaseActorDataModel>;
	}

	protected override _canDrag(user: User, event?: PIXI.InteractionEvent): boolean {
		return super._canDrag(user, event);
	}
}
