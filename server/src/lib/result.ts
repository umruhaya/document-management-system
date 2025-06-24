export type ResultType<OkType, ErrType extends { type: string }> =
  | { ok: true; value: OkType }
  | { ok: false; error: ErrType };
// All utilities under the Result class
export class Result {
  static ok<OkType, ErrType extends { type: string }>(value: OkType): ResultType<OkType, ErrType> {
    return { ok: true, value };
  }

  static err<OkType, ErrType extends { type: string }>(error: ErrType): ResultType<OkType, ErrType> {
    return { ok: false, error };
  }

  static isOk<OkType, ErrType extends { type: string }>(
    result: ResultType<OkType, ErrType>
  ): result is { ok: true; value: OkType } {
    return result.ok;
  }

  static isErr<OkType, ErrType extends { type: string }>(
    result: ResultType<OkType, ErrType>
  ): result is { ok: false; error: ErrType } {
    return !result.ok;
  }
}