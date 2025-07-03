// Generic Errors
export class UnknownError extends Error {
	constructor(input: unknown, reason: string, options?: ErrorOptions) {
		super(`Unknown error: ${reason} \nInput: ${JSON.stringify(input)}`, options)
	}
}
export class AuthenticationError extends Error {
	constructor(input: unknown, reason: string, options?: ErrorOptions) {
		super(`Authentication error: ${reason} \nInput: ${JSON.stringify(input)}`, options)
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
