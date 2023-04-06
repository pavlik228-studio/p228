interface IInputSchema {
  [key: number]: unknown
}
export class InputRegistry<TInputSchema extends IInputSchema = IInputSchema> {
  constructor(private readonly _schema: TInputSchema) {

  }

  public onInput<TKey extends keyof TInputSchema>(key: TKey, callback: (value: TInputSchema[TKey]) => void) {

  }
}
