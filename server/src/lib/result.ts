export type ResultType<OkType, ErrType extends { type: string }> =
	| { ok: true; value: OkType }
	| { ok: false; error: ErrType }
// All utilities under the Result class

function ok<OkType, ErrType extends { type: string }>(value: OkType): ResultType<OkType, ErrType> {
	return { ok: true, value }
}

function err<OkType, ErrType extends { type: string }>(error: ErrType): ResultType<OkType, ErrType> {
	return { ok: false, error }
}

function isOk<OkType, ErrType extends { type: string }>(
	result: ResultType<OkType, ErrType>,
): result is { ok: true; value: OkType } {
	return result.ok
}

function isErr<OkType, ErrType extends { type: string }>(
	result: ResultType<OkType, ErrType>,
): result is { ok: false; error: ErrType } {
	return !result.ok
}

export const Result = { ok, err, isOk, isErr }
