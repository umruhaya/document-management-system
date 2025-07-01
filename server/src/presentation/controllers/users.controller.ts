import { matchRes } from '@carbonteq/fp'
import type { Request, Response } from 'express'
import { UserService } from '~/app/services/user.service'
import { UserRepositoryPg } from '~/infra/repositories/pg/user.repository.pg'
import * as dtos from '~/presentation/dtos/users'
import type { JWTDecodedPayload } from '~/presentation/types'
import { mapEntityErrorToStatusCode } from '~/presentation/utils/http-error-mapper'

const userService = new UserService(new UserRepositoryPg())

type AuthRequest = Request & { jwtPayload: JWTDecodedPayload }

export const usersController = {
	async getMe(req: Request, res: Response): Promise<void> {
		const { userId } = (req as AuthRequest).jwtPayload
		const result = await userService.getById(userId)
		matchRes(result, {
			Ok: ({ id, username, createdAt, updatedAt }) => res.json({ userId: id, username, createdAt, updatedAt }),
			Err: (err) => res.status(mapEntityErrorToStatusCode(err)).json({ error: err.message }),
		})
	},

	async getByUsername(req: Request, res: Response): Promise<void> {
		const { data: query, success, error } = dtos.GetUserQuery.safeParse(req.query)
		if (!success) {
			res.status(422).json(error.message)
			return
		}
		const result = await userService.getByUsername(query.username)
		matchRes(result, {
			Ok: ({ username, id }) => res.json({ userId: id, username }),
			Err: (err) => res.status(mapEntityErrorToStatusCode(err)).json({ error: err.message }),
		})
	},

	async create(req: Request, res: Response): Promise<void> {
		const user = req.body
		const result = await userService.create(user)
		matchRes(result, {
			Ok: ({ token }) => res.status(201).json({ token }),
			Err: (err) => res.status(mapEntityErrorToStatusCode(err)).json({ error: err.message }),
		})
	},

	async update(req: Request, res: Response): Promise<void> {
		const { userId } = (req as AuthRequest).jwtPayload
		const { data: user, success, error } = dtos.UserUpdate.safeParse(req.body)
		if (!success) {
			res.status(422).json(error.message)
			return
		}
		const result = await userService.update({ id: userId, ...user })
		matchRes(result, {
			Ok: () => res.status(204).send(),
			Err: (err) => res.status(mapEntityErrorToStatusCode(err)).json({ error: err.message }),
		})
	},

	async login(req: Request, res: Response): Promise<void> {
		const { data, success, error } = dtos.LoginUserRequest.safeParse(req.body)
		if (!success) {
			res.status(422).json(error.message)
			return
		}
		const result = await userService.login(data)
		matchRes(result, {
			Ok: ({ token }) => res.json({ token }),
			Err: (err) => res.status(mapEntityErrorToStatusCode(err)).json({ error: err.message }),
		})
	},
}
