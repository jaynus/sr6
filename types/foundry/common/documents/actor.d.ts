declare module foundry {
	module documents {
		/**
		 * The Actor document model.
		 * @param    data Initial data from which to construct the document.
		 * @property data The constructed data object for the document.
		 */
		class BaseActor extends abstract.Document {
			prototypeToken: foundry.data.PrototypeToken;

			/** The default icon used for newly created Actor documents */
			static DEFAULT_ICON: ImageFilePath;

			static override get schema(): ConstructorOf<data.ActorData<BaseActor, BaseActiveEffect, BaseItem>>;

			static override get metadata(): ActorMetadata;

			/** A Collection of Item embedded Documents */
			readonly items: abstract.EmbeddedCollection<documents.BaseItem>;

			/** A Collection of ActiveEffect embedded Documents */
			readonly effects: abstract.EmbeddedCollection<documents.BaseActiveEffect>;

			/**
			 * Migrate the system data object to conform to data model defined by the current system version.
			 * @see mergeObject
			 * @param options Options which customize how the system data is migrated.
			 * @param options.insertKeys Retain keys which exist in the current data, but not the model
			 * @param options.insertValues Retain inner-object values which exist in the current data, but not the model
			 * @param options.enforceTypes Require that data types match the model exactly to be retained
			 * @return The migrated system data object, not yet saved to the database
			 */
			migrateSystemData({ insertKeys, insertValues, enforceTypes }?: { insertKeys?: boolean; insertValues?: boolean; enforceTypes?: boolean }): this['data']['system'];

			protected override _preCreate(data: PreDocumentId<this['_source']>, options: DocumentModificationContext, user: BaseUser): Promise<void>;

			protected override _preUpdate(changed: DocumentUpdateData<BaseActor>, options: DocumentModificationContext, user: BaseUser): Promise<void>;

			/**
			 * Actions taken after descendant documents have been created, but before changes are applied to the client data.
			 * @param parent     The direct parent of the created Documents, may be this Document or a child
			 * @param collection The collection within which documents are being created
			 * @param data       The source data for new documents that are being created
			 * @param options    Options which modified the creation operation
			 * @param userId     The ID of the User who triggered the operation
			 */
			protected _preCreateDescendantDocuments(parent: this, collection: string, data: object[], options: DocumentModificationContext<this>, userId: string): void;

			/**
			 * Actions taken after descendant documents have been created and changes have been applied to client data.
			 * @param parent     The direct parent of the created Documents, may be this Document or a child
			 * @param collection The collection within which documents were created
			 * @param documents  The array of created Documents
			 * @param data       The source data for new documents that were created
			 * @param options    Options which modified the creation operation
			 * @param userId     The ID of the User who triggered the operation
			 */
			protected _onCreateDescendantDocuments(parent: this, collection: string, documents: foundry.abstract.Document[], data: object[], options: DocumentModificationContext<this>, userId: string): void;

			/**
			 * Actions taken after descendant documents have been updated, but before changes are applied to the client data.
			 * @param parent         The direct parent of the updated Documents, may be this Document or a child
			 * @param collection       The collection within which documents are being updated
			 * @param changes        The array of differential Document updates to be applied
			 * @param options          Options which modified the update operation
			 * @param userId           The ID of the User who triggered the operation
			 */
			protected _preUpdateDescendantDocuments(parent: this, collection: string, changes: object[], options: DocumentModificationContext<this>, userId: string): void;

			/**
			 * Actions taken after descendant documents have been updated and changes have been applied to client data.
			 * @param parent     The direct parent of the updated Documents, may be this Document or a child
			 * @param collection The collection within which documents were updated
			 * @param documents  The array of updated Documents
			 * @param changes    The array of differential Document updates which were applied
			 * @param options    Options which modified the update operation
			 * @param userId     The ID of the User who triggered the operation
			 */
			protected _onUpdateDescendantDocuments(parent: this, collection: string, documents: ClientDocument[], changes: object[], options: DocumentModificationContext<this>, userId: string): void;

			/**
			 * Actions taken after descendant documents have been deleted, but before deletions are applied to the client data.
			 * @param parent     The direct parent of the deleted Documents, may be this Document or a child
			 * @param collection The collection within which documents were deleted
			 * @param ids        The array of document IDs which were deleted
			 * @param options    Options which modified the deletion operation
			 * @param userId     The ID of the User who triggered the operation
			 */
			protected _preDeleteDescendantDocuments(parent: this, collection: string, ids: string[], options: DocumentModificationContext<this>, userId: string): void;

			/**
			 * Actions taken after descendant documents have been deleted and those deletions have been applied to client data.
			 * @param parent     The direct parent of the deleted Documents, may be this Document or a child
			 * @param collection The collection within which documents were deleted
			 * @param documents  The array of Documents which were deleted
			 * @param ids        The array of document IDs which were deleted
			 * @param options    Options which modified the deletion operation
			 * @param userId     The ID of the User who triggered the operation
			 */
			protected _onDeleteDescendantDocuments(parent: this, collection: string, documents: foundry.abstract.Document[], ids: string[], options: DocumentModificationContext<this>, userId: string): void;
		}

		interface BaseActor {
			readonly data: data.ActorData<BaseActor, BaseActiveEffect, BaseItem>;

			readonly parent: BaseToken | null;

			// V10 shim
			readonly system: this['data']['system'];

			get documentName(): (typeof BaseActor)['metadata']['name'];
		}

		interface ActorMetadata extends abstract.DocumentMetadata {
			name: 'Actor';
			collection: 'actors';
			label: 'DOCUMENT.Actor';
			embedded: {
				ActiveEffect: typeof BaseActiveEffect;
				Item: typeof BaseItem;
			};
			isPrimary: true;
			hasSystemData: true;
			permissions: {
				create: 'ACTOR_CREATE';
				update: 'ASSISTANT';
				delete: 'ASSISTANT';
			};
			types: string[];
		}
	}
}
