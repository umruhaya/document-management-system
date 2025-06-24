import * as HttpStatusCodes from 'stoker/http-status-codes'
import { inject, injectable } from 'tsyringe'
import type { Logger } from '~/logger/Logger'
import * as dtos from '~/presentation/http/dtos/users'
import { httpResponse } from '~/presentation/http/lib'
import { UserRepository } from '~/repositories/user'

@injectable()
export class UsersController {
	constructor(
		@inject(UserRepository) private readonly userRepository: UserRepository,
		@inject('Logger') private readonly logger: Logger,
	) {}

	async getByUsername({ query }: { query: unknown }) {
		this.logger.info('UsersController.getByUsername called', { query })
		const parseResult = dtos.GetUserQuery.safeParse(query)
		if (!parseResult.success) {
			return httpResponse({
				json: { error: parseResult.error.errors },
				statusCode: HttpStatusCodes.UNPROCESSABLE_ENTITY,
			})
		}
		const { username } = parseResult.data
		const result = await this.userRepository.getByUsername(username)
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

	async create({ body }: { body: unknown }) {
		this.logger.info('UsersController.create called')
		const parseResult = dtos.UserCredentials.safeParse(body)
		if (!parseResult.success) {
			return httpResponse({
				json: { error: parseResult.error.errors },
				statusCode: HttpStatusCodes.UNPROCESSABLE_ENTITY,
			})
		}
		const { username, password } = parseResult.data
		const result = await this.userRepository.create(username, password)
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

	async login({ body }: { body: unknown }) {
		this.logger.info('UsersController.login called')
		const parseResult = dtos.LoginUserRequest.safeParse(body)
		if (!parseResult.success) {
			return httpResponse({
				json: { error: parseResult.error.errors },
				statusCode: HttpStatusCodes.UNPROCESSABLE_ENTITY,
			})
		}
		const { username, password } = parseResult.data
		const result = await this.userRepository.login(username, password)
		if (result.ok) {
			return httpResponse({ json: result.value, statusCode: HttpStatusCodes.OK })
		}
		if (result.error.type === 'InvalidCredentials') {
			return httpResponse({ json: result.error.message, statusCode: HttpStatusCodes.UNAUTHORIZED })
		}
		return httpResponse({ json: result.error.message, statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR })
	}

	async update({ userId, body }: { userId: string; body: unknown }) {
		this.logger.info('UsersController.update called', { userId })
		const parseResult = dtos.UserUpdate.safeParse(body)
		if (!parseResult.success) {
			return httpResponse({
				json: { error: parseResult.error.errors },
				statusCode: HttpStatusCodes.UNPROCESSABLE_ENTITY,
			})
		}
		const { username, password, newUsername } = parseResult.data
		const result = await this.userRepository.update(userId, { username, password, newUsername })
		if (result.ok) {
			return httpResponse({ json: result.value, statusCode: HttpStatusCodes.OK })
		}
		if (result.error.type === 'UserNotFound') {
			return httpResponse({ json: result.error.message, statusCode: HttpStatusCodes.NOT_FOUND })
		}
		return httpResponse({ json: result.error.message, statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR })
	}

	async getMe({ userId }: { userId: string }) {
		this.logger.info('UsersController.getMe called', { userId })
		const result = await this.userRepository.getMe(userId)
		if (result.ok) {
			return httpResponse({ json: result.value, statusCode: HttpStatusCodes.OK })
		}
		if (result.error.type === 'UserNotFound') {
			return httpResponse({ json: result.error.message, statusCode: HttpStatusCodes.NOT_FOUND })
		}
		return httpResponse({ json: result.error.message, statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR })
	}
}
