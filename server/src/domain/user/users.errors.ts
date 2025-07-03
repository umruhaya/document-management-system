import { AlreadyExistsError, DomainError, NotFoundError, ValidationError } from '../errors/errors.base'

// User-specific Domain Error
export class UserDomainError extends DomainError {
	constructor(input: unknown, reason: string) {
		super(`User domain error: ${reason}, input: ${JSON.stringify(input)}`)
	}
}

// User-specific Validation Error
export class UserValidationError extends ValidationError {
	constructor(input: unknown, reason: string) {
		super(`User validation error: ${reason}, input: ${JSON.stringify(input)}`)
	}
}

// User Already Exists Error
export class UserAlreadyExistsError extends AlreadyExistsError {
	constructor(input: unknown) {
		super(`User already exists \nInput: ${JSON.stringify(input)}`)
	}
}

// User Not Found Error
export class UserNotFoundError extends NotFoundError {
	constructor(input: unknown) {
		super(`User not found \nInput: ${JSON.stringify(input)}`)
	}
}
