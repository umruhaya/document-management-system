import { AlreadyExistsError, DomainError, NotFoundError, ValidationError } from './errors.base'

// User-specific Domain Error
export class ACLEntryDomainError extends DomainError {
	constructor(input: unknown, reason: string) {
		super(input, `ACL Entry domain error: ${reason}`)
	}
}

// User-specific Validation Error
export class ACLEntryValidationError extends ValidationError {
	constructor(input: unknown, reason: string) {
		super(input, `ACL Entry validation error: ${reason}`)
	}
}

// User Already Exists Error
export class ACLEntryAlreadyExistsError extends AlreadyExistsError {
	constructor(input: unknown) {
		super(input)
		this.message = `ACL Entry already exists \nInput: ${JSON.stringify(input)}`
	}
}

// User Not Found Error
export class ACLEntryNotFoundError extends NotFoundError {
	constructor(input: unknown) {
		super(input)
		this.message = `ACL Entry not found \nInput: ${JSON.stringify(input)}`
	}
}
