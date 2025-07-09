import {
	AlreadyExistsError,
	GenericDomainError,
	GuardViolationError,
	InvalidOperation,
	NotFoundError,
	UnauthorizedOperation,
	ValidationError,
} from '~/hexapp'

export class AccessControlGenericDomainError extends GenericDomainError {
	// biome-ignore lint/complexity/noUselessConstructor: Need to make the constructor public
	public constructor(message: string) {
		super(message)
	}
}

export class AccessControlNotFoundError extends NotFoundError {
	// biome-ignore lint/complexity/noUselessConstructor: Need to make the constructor public
	public constructor(message: string) {
		super(message)
	}
}

export class AccessControlAlreadyExistsError extends AlreadyExistsError {
	// biome-ignore lint/complexity/noUselessConstructor: Need to make the constructor public
	public constructor(message: string) {
		super(message)
	}
}

export class AccessControlUnauthorizedOperation extends UnauthorizedOperation {
	// biome-ignore lint/complexity/noUselessConstructor: Need to make the constructor public
	public constructor(message: string) {
		super(message)
	}
}
export class AccessControlInvalidOperation extends InvalidOperation {
	// biome-ignore lint/complexity/noUselessConstructor: Need to make the constructor public
	public constructor(message: string) {
		super(message)
	}
}

export class AccessControlValidationError extends ValidationError {
	// biome-ignore lint/complexity/noUselessConstructor: Need to make the constructor public
	public constructor(message: string) {
		super(message)
	}
}

export class AccessControlGuardViolationError extends GuardViolationError {
	// biome-ignore lint/complexity/noUselessConstructor: Need to make the constructor public
	public constructor(message: string) {
		super(message)
	}
}

export type AccessControlDomainErr =
	| AlreadyExistsError
	| GenericDomainError
	| InvalidOperation
	| NotFoundError
	| UnauthorizedOperation
	| ValidationError
	| GuardViolationError
