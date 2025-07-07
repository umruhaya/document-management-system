import {
	AlreadyExistsError,
	GenericDomainError,
	GuardViolationError,
	InvalidOperation,
	NotFoundError,
	UnauthorizedOperation,
	ValidationError,
} from '@carbonteq/hexapp'

export class UserGenericDomainError extends GenericDomainError {}

export class UserNotFoundError extends NotFoundError {}

export class UserAlreadyExistsError extends AlreadyExistsError {}

export class UserUnauthorizedOperation extends UnauthorizedOperation {}
export class UserInvalidOperation extends InvalidOperation {}

export class UserValidationError extends ValidationError {
	// biome-ignore lint/complexity/noUselessConstructor: Need to make the constructor public
	public constructor(message: string) {
		super(message)
	}
}

export class UserGuardViolationError extends GuardViolationError {}

export type UserDomainErr =
	| AlreadyExistsError
	| GenericDomainError
	| InvalidOperation
	| NotFoundError
	| UnauthorizedOperation
	| ValidationError
	| GuardViolationError
