import {
	AlreadyExistsError,
	GenericDomainError,
	GuardViolationError,
	InvalidOperation,
	NotFoundError,
	UnauthorizedOperation,
	ValidationError,
} from '~/hexapp'

export class AccessControlGenericDomainError extends GenericDomainError {}

export class AccessControlNotFoundError extends NotFoundError {}

export class AccessControlAlreadyExistsError extends AlreadyExistsError {}

export class AccessControlUnauthorizedOperation extends UnauthorizedOperation {}
export class AccessControlInvalidOperation extends InvalidOperation {}

export class AccessControlValidationError extends ValidationError {
	// biome-ignore lint/complexity/noUselessConstructor: Need to make the constructor public
	public constructor(message: string) {
		super(message)
	}
}

export class AccessControlGuardViolationError extends GuardViolationError {}

export type AccessControlDomainErr =
	| AlreadyExistsError
	| GenericDomainError
	| InvalidOperation
	| NotFoundError
	| UnauthorizedOperation
	| ValidationError
	| GuardViolationError
