import { AlreadyExistsError, DomainError, NotFoundError, ValidationError } from './errors.base'

// User-specific Domain Error
export class UserDomainError extends DomainError {
	constructor(input: unknown, reason: string) {
		super(input, `User domain error: ${reason}`)
	}
}

// User-specific Validation Error
export class UserValidationError extends ValidationError {
	constructor(input: unknown, reason: string) {
		super(input, `User validation error: ${reason}`)
	}
}

// User Already Exists Error
export class UserAlreadyExistsError extends AlreadyExistsError {
	constructor(input: unknown) {
		super(input)
		this.message = `User already exists \nInput: ${JSON.stringify(input)}`
	}
}

// User Not Found Error
export class UserNotFoundError extends NotFoundError {
	constructor(input: unknown) {
		super(input)
		this.message = `User not found \nInput: ${JSON.stringify(input)}`
	}
}
