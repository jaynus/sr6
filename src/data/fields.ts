export class EnumNumberField<
	_TEnum extends object,
	TRequired extends boolean = true,
	TNullable extends boolean = false,
	THasInitial extends boolean = true,
> extends foundry.data.fields.NumberField<number, number, TRequired, TNullable, THasInitial> {
	override validate(
		value: unknown,
		options?: foundry.data.fields.DataFieldValidationOptions,
	): foundry.data.fields.DataModelValidationFailure | void {
		return super.validate(value, options);
	}
}

export class DocumentUUIDField<
	TRequired extends boolean = true,
	TNullable extends boolean = true,
	THasInitial extends boolean = true,
> extends foundry.data.fields.StringField<string, string, TRequired, TNullable, THasInitial> {
	override validate(
		value: unknown,
		options?: foundry.data.fields.DataFieldValidationOptions,
	): foundry.data.fields.DataModelValidationFailure | void {
		// let parsed = parseUuid(value as string);
		// if (!parsed.uuid || !(parsed.collection && parsed.documentId)) {
		// new foundry.data.fields.DataModelValidationFailure({ message: 'Invalid UUID', unresolved: true });
		//	throw 'WTF';
		// }
		return super.validate(value, options);
	}
}
