import { AlreadyExistsError, DomainError, NotFoundError, ValidationError } from '../errors/errors.base'

// Document-specific Domain Error
export class DocumentDomainError extends DomainError {
	constructor(input: unknown, reason: string) {
		super(`Document domain error: ${reason}, input: ${JSON.stringify(input)}`)
	}
}

// Document-specific Validation Error
export class DocumentValidationError extends ValidationError {
	constructor(input: unknown, reason: string) {
		super(`Document validation error: ${reason}, input: ${JSON.stringify(input)}`)
	}
}

// Document Already Exists Error
export class DocumentAlreadyExistsError extends AlreadyExistsError {
	constructor(input: unknown) {
		super(`Document already exists \nInput: ${JSON.stringify(input)}`)
	}
}

// Document Not Found Error
export class DocumentNotFoundError extends NotFoundError {
	constructor(input: unknown) {
		super(`Document not found \nInput: ${JSON.stringify(input)}`)
	}
}
