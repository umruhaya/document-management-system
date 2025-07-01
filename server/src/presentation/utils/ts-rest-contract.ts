import type { AppRouter, ServerInferRequest, ServerInferResponses } from '@ts-rest/core'

type MaybePromise<T> = T | Promise<T>

export type InferContract<TContract extends AppRouter> = {
	[K in keyof TContract]: (
		request: ServerInferRequest<TContract[K]>,
	) => MaybePromise<ServerInferResponses<TContract[K]>>
}
