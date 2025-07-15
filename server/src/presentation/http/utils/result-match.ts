import type { Result } from '@carbonteq/fp'

// @carbonteq/fp matchRes tries to infer the return type for Ok and Err handler as the same,
// which in some case can be unintended especially if we want to use the return type of both
// handlers as a union (Ok | Err)

// Here is the carbonteq implementation
// export const matchRes = <T, E, U>(r: Result<T, E>, branches: { Ok: (val: T) => U; Err: (err: E) => U }): U => {
// 	if (r.isOk()) {
// 		return branches.Ok(r.unwrap())
// 	}
// 	return branches.Err(r.unwrapErr())
// }

export const matchResultReturn = <Ok, Error, OkValue, ErrValue>(
	r: Result<Ok, Error>,
	branches: { Ok: (val: Ok) => OkValue; Err: (err: Error) => ErrValue },
): OkValue | ErrValue => {
	if (r.isOk()) {
		return branches.Ok(r.unwrap())
	}
	return branches.Err(r.unwrapErr())
}
