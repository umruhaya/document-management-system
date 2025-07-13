import {
	AlreadyExistsError,
	DomainError,
	GenericDomainError,
	InvalidOperation,
	NotFoundError,
	UnauthorizedOperation,
	ValidationError,
} from '~/hexapp'

export function mapErrorToStatusCode(error: Error) {
	if (error instanceof ValidationError) return 400
	if (error instanceof InvalidOperation) return 400
	if (error instanceof GenericDomainError) return 400
	if (error instanceof DomainError) return 400
	if (error instanceof UnauthorizedOperation) return 401
	if (error instanceof NotFoundError) return 404
	if (error instanceof AlreadyExistsError) return 409
	return 500
}
