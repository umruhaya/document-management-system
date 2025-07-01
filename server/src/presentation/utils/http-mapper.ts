import type { Result } from '@carbonteq/fp'
import type { HTTPStatusCode } from '@ts-rest/core'
import {
	AuthenticationError,
	EntityAlreadyExistsError,
	type EntityError,
	EntityNotFoundError,
	EntityUnknownError,
	EntityValidationError,
} from '~/domain/errors'

export function mapEntityErrorToStatusCode(error: Error) {
	if (error instanceof EntityValidationError) return 400
	if (error instanceof AuthenticationError) return 401
	if (error instanceof EntityNotFoundError) return 404
	if (error instanceof EntityAlreadyExistsError) return 409
	if (error instanceof EntityUnknownError) return 500
	return 500
}

export const mapResultToHttpResponse: <T, S extends HTTPStatusCode, E extends Error>(
	result: Result<T, E>,
	successCode: S,
	headers?: Record<string, string>,
) =>
	| {
			status: S
			body: T
			headers?: Record<string, string>
	  }
	| {
			status: HTTPStatusCode
			body: string
			headers?: Record<string, string>
	  } = (result, successCode, headers) => {
	if (result.isOk()) {
		const body = result.unwrap()
		return { status: successCode, body, headers }
	}
	const error = result.unwrapErr()
	return { status: mapEntityErrorToStatusCode(error), body: error.message, headers }
}
