import { AlreadyExistsError, DomainError, NotFoundError, ValidationError } from '../errors/errors.base'

// ACL Entry-specific Domain Error
export class ACLEntryDomainError extends DomainError {
	constructor(input: unknown, reason: string) {
		super(`ACL Entry domain error: ${reason}, input: ${JSON.stringify(input)}`)
	}
}

// ACL Entry-specific Validation Error
export class ACLEntryValidationError extends ValidationError {
	constructor(input: unknown, reason: string) {
		super(`ACL Entry validation error: ${reason}, input: ${JSON.stringify(input)}`)
	}
}

// ACL Entry Already Exists Error
export class ACLEntryAlreadyExistsError extends AlreadyExistsError {
	constructor(input: unknown) {
		super(`ACL Entry already exists \nInput: ${JSON.stringify(input)}`)
	}
}

// ACL Entry Not Found Error
export class ACLEntryNotFoundError extends NotFoundError {
	constructor(input: unknown) {
		super(`ACL Entry not found \nInput: ${JSON.stringify(input)}`)
	}
}
