import {
	AuthenticationError,
	EntityAlreadyExistsError,
	type EntityError,
	EntityNotFoundError,
	EntityUnknownError,
	EntityValidationError,
} from '~/domain/errors'

export function mapEntityErrorToStatusCode(error: EntityError): number {
	if (error instanceof EntityValidationError) return 400
	if (error instanceof AuthenticationError) return 401
	if (error instanceof EntityNotFoundError) return 404
	if (error instanceof EntityAlreadyExistsError) return 409
	if (error instanceof EntityUnknownError) return 500
	return 500
}
