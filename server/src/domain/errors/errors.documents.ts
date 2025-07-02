import { AlreadyExistsError, DomainError, NotFoundError, ValidationError } from './errors.base'

// Document-specific Domain Error
export class DocumentDomainError extends DomainError {
	constructor(input: unknown, reason: string) {
		super(input, `Document domain error: ${reason}`)
	}
}

// Document-specific Validation Error
export class DocumentValidationError extends ValidationError {
	constructor(input: unknown, reason: string) {
		super(input, `Document validation error: ${reason}`)
	}
}

// Document Already Exists Error
export class DocumentAlreadyExistsError extends AlreadyExistsError {
	constructor(input: unknown) {
		super(input)
		this.message = `Document already exists \nInput: ${JSON.stringify(input)}`
	}
}

// Document Not Found Error
export class DocumentNotFoundError extends NotFoundError {
	constructor(input: unknown) {
		super(input)
		this.message = `Document not found \nInput: ${JSON.stringify(input)}`
	}
}
