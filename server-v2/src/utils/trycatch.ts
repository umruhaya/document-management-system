type TryCatchArgs<Value, Err> = {
	fn: () => Value
	onError: (error: unknown) => Err
}

export function TryCatch<Value, Err>(args: TryCatchArgs<Value, Err>) {
	try {
		return args.fn()
	} catch (error) {
		return args.onError(error)
	}
}

type TryCatchAsyncArgs<Value, Err> = {
	fn: () => Promise<Value>
	onError: (error: unknown) => Err
}

export async function TryCatchAsync<Value, Err>(args: TryCatchAsyncArgs<Value, Err>) {
	try {
		return await args.fn()
	} catch (error) {
		return args.onError(error)
	}
}
