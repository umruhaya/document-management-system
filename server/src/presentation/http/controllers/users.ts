import * as HttpStatusCodes from 'stoker/http-status-codes'
import * as dtos from '~/presentation/http/dtos/users'
import { httpResponse } from '~/presentation/http/lib'
import { UserRepository } from '~/repositories/user'

const userRepository = new UserRepository()

export const getByUsername = async ({ query }: { query: unknown }) => {
	const parseResult = dtos.GetUserQuery.safeParse(query)
	if (!parseResult.success) {
		return httpResponse({ json: { error: parseResult.error.errors }, statusCode: HttpStatusCodes.UNPROCESSABLE_ENTITY })
	}
	const { username } = parseResult.data
	const result = await userRepository.getByUsername(username)
	if (result.ok) {
		return httpResponse({ json: result.value, statusCode: HttpStatusCodes.OK })
	}
	if (result.error.type === 'UserNotFound') {
		return httpResponse({
			json: result.error.message,
			statusCode: HttpStatusCodes.NOT_FOUND,
		})
	}
	return httpResponse({ json: result.error.message, statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR })
}

export const create = async ({ body }: { body: unknown }) => {
	const parseResult = dtos.UserCredentials.safeParse(body)
	if (!parseResult.success) {
		return httpResponse({ json: { error: parseResult.error.errors }, statusCode: HttpStatusCodes.UNPROCESSABLE_ENTITY })
	}
	const { username, password } = parseResult.data
	const result = await userRepository.create(username, password)
	if (result.ok) {
		return httpResponse({ json: result.value, statusCode: HttpStatusCodes.OK })
	}
	if (result.error.type === 'UserAlreadyExists') {
		return httpResponse({
			json: result.error.message,
			statusCode: HttpStatusCodes.CONFLICT,
		})
	}
	return httpResponse({ json: result.error.message, statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR })
}

export const login = async ({ body }: { body: unknown }) => {
	const parseResult = dtos.LoginUserRequest.safeParse(body)
	if (!parseResult.success) {
		return httpResponse({ json: { error: parseResult.error.errors }, statusCode: HttpStatusCodes.UNPROCESSABLE_ENTITY })
	}
	const { username, password } = parseResult.data
	const result = await userRepository.login(username, password)
	if (result.ok) {
		return httpResponse({ json: result.value, statusCode: HttpStatusCodes.OK })
	}
	if (result.error.type === 'InvalidCredentials') {
		return httpResponse({ json: result.error.message, statusCode: HttpStatusCodes.UNAUTHORIZED })
	}
	return httpResponse({ json: result.error.message, statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR })
}

export const update = async ({ userId, body }: { userId: string; body: unknown }) => {
	const parseResult = dtos.UserUpdate.safeParse(body)
	if (!parseResult.success) {
		return httpResponse({ json: { error: parseResult.error.errors }, statusCode: HttpStatusCodes.UNPROCESSABLE_ENTITY })
	}
	const { username, password, newUsername } = parseResult.data
	const result = await userRepository.update(userId, { username, password, newUsername })
	if (result.ok) {
		return httpResponse({ json: result.value, statusCode: HttpStatusCodes.OK })
	}
	if (result.error.type === 'UserNotFound') {
		return httpResponse({ json: result.error.message, statusCode: HttpStatusCodes.NOT_FOUND })
	}
	return httpResponse({ json: result.error.message, statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR })
}

export const getMe = async ({ userId }: { userId: string }) => {
	const result = await userRepository.getMe(userId)
	if (result.ok) {
		return httpResponse({ json: result.value, statusCode: HttpStatusCodes.OK })
	}
	if (result.error.type === 'UserNotFound') {
		return httpResponse({ json: result.error.message, statusCode: HttpStatusCodes.NOT_FOUND })
	}
	return httpResponse({ json: result.error.message, statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR })
}
