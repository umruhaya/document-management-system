// Generic Errors
export class UnknownError extends Error {
	constructor(input: unknown, reason: string) {
		super(`Unknown error: ${reason} \nInput: ${JSON.stringify(input)}`)
	}
}
export class AuthenticationError extends Error {
	constructor(input: unknown, reason: string) {
		super(`Unknown error: ${reason} \nInput: ${JSON.stringify(input)}`)
	}
}

// To be Extended
export abstract class DomainError extends Error {
	// Prevent direct instantiation
	protected constructor(message: string, options?: ErrorOptions) {
		super(message, options)
	}
}
export abstract class ValidationError extends Error {
	protected constructor(message: string, options?: ErrorOptions) {
		super(message, options)
	}
}
export abstract class AlreadyExistsError extends Error {
	protected constructor(message: string, options?: ErrorOptions) {
		super(message, options)
	}
}
export abstract class NotFoundError extends Error {
	protected constructor(message: string, options?: ErrorOptions) {
		super(message, options)
	}
}
