import {
	AlreadyExistsError,
	GenericDomainError,
	GuardViolationError,
	InvalidOperation,
	NotFoundError,
	UnauthorizedOperation,
	ValidationError,
} from '~/hexapp'

export class DocumentGenericDomainError extends GenericDomainError {}

export class DocumentNotFoundError extends NotFoundError {}

export class DocumentAlreadyExistsError extends AlreadyExistsError {}

export class DocumentUnauthorizedOperation extends UnauthorizedOperation {}
export class DocumentInvalidOperation extends InvalidOperation {}

export class DocumentValidationError extends ValidationError {
	// biome-ignore lint/complexity/noUselessConstructor: Need to make the constructor public
	public constructor(message: string) {
		super(message)
	}
}

export class DocumentGuardViolationError extends GuardViolationError {}

export type DocumentDomainErr =
	| AlreadyExistsError
	| GenericDomainError
	| InvalidOperation
	| NotFoundError
	| UnauthorizedOperation
	| ValidationError
	| GuardViolationError
