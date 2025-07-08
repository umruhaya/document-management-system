import {
	AlreadyExistsError,
	GenericDomainError,
	GuardViolationError,
	InvalidOperation,
	NotFoundError,
	UnauthorizedOperation,
	ValidationError,
} from '~/hexapp'

export class UserGenericDomainError extends GenericDomainError {
	// biome-ignore lint/complexity/noUselessConstructor: Need to make the constructor public
	public constructor(message: string) {
		super(message)
	}
}

export class UserNotFoundError extends NotFoundError {
	// biome-ignore lint/complexity/noUselessConstructor: Need to make the constructor public
	public constructor(message: string) {
		super(message)
	}
}

export class UserAlreadyExistsError extends AlreadyExistsError {
	// biome-ignore lint/complexity/noUselessConstructor: Need to make the constructor public
	public constructor(message: string) {
		super(message)
	}
}

export class UserUnauthorizedOperation extends UnauthorizedOperation {
	// biome-ignore lint/complexity/noUselessConstructor: Need to make the constructor public
	public constructor(message: string) {
		super(message)
	}
}
export class UserInvalidOperation extends InvalidOperation {
	// biome-ignore lint/complexity/noUselessConstructor: Need to make the constructor public
	public constructor(message: string) {
		super(message)
	}
}

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
