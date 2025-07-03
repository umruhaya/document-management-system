import type { Result } from '@carbonteq/fp'
import type { HTTPStatusCode } from '@ts-rest/core'
import {
	AlreadyExistsError,
	AuthenticationError,
	DomainError,
	NotFoundError,
	UnknownError,
	ValidationError,
} from '~/domain/errors'

export function mapErrorToStatusCode(error: Error) {
	if (error instanceof ValidationError) return 400
	if (error instanceof DomainError) return 400
	if (error instanceof AuthenticationError) return 401
	if (error instanceof NotFoundError) return 404
	if (error instanceof AlreadyExistsError) return 409
	if (error instanceof UnknownError) return 500
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
	return { status: mapErrorToStatusCode(error), body: error.message, headers }
}
