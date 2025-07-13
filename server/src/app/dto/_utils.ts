import type { z } from 'zod'
export type InferZodTypesRecursively<T> = {
	[K in keyof T]: T[K] extends z.ZodTypeAny
		? z.infer<T[K]>
		: T[K] extends object
			? InferZodTypesRecursively<T[K]>
			: T[K]
}
