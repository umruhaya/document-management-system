import {
	AlreadyExistsError,
	GenericDomainError,
	GuardViolationError,
	InvalidOperation,
	NotFoundError,
	UnauthorizedOperation,
	ValidationError,
} from '~/hexapp'

export class DocumentGenericDomainError extends GenericDomainError {
	// biome-ignore lint/complexity/noUselessConstructor: Need to make the constructor public
	public constructor(message: string) {
		super(message)
	}
}

export class DocumentNotFoundError extends NotFoundError {
	// biome-ignore lint/complexity/noUselessConstructor: Need to make the constructor public
	public constructor(message: string) {
		super(message)
	}
}

export class DocumentAlreadyExistsError extends AlreadyExistsError {
	// biome-ignore lint/complexity/noUselessConstructor: Need to make the constructor public
	public constructor(message: string) {
		super(message)
	}
}

export class DocumentUnauthorizedOperation extends UnauthorizedOperation {
	// biome-ignore lint/complexity/noUselessConstructor: Need to make the constructor public
	public constructor(message: string) {
		super(message)
	}
}
export class DocumentInvalidOperation extends InvalidOperation {
	// biome-ignore lint/complexity/noUselessConstructor: Need to make the constructor public
	public constructor(message: string) {
		super(message)
	}
}

export class DocumentValidationError extends ValidationError {
	// biome-ignore lint/complexity/noUselessConstructor: Need to make the constructor public
	public constructor(message: string) {
		super(message)
	}
}

export class DocumentGuardViolationError extends GuardViolationError {
	// biome-ignore lint/complexity/noUselessConstructor: Need to make the constructor public
	public constructor(message: string) {
		super(message)
	}
}

export type DocumentDomainErr =
	| AlreadyExistsError
	| GenericDomainError
	| InvalidOperation
	| NotFoundError
	| UnauthorizedOperation
	| ValidationError
	| GuardViolationError
