import { Router } from 'express'
import { jwtMiddleware } from '~/presentation/http/express/middlewares/jwt'
import { JWTDecodedPayload } from '~/presentation/http/types'
import * as dtos from '~/presentation/http/dtos/users'
import * as usersController from '~/presentation/http/controllers/users'

const router = Router()
export const usersRouter = router

// GET /users?username=...
router.get(
	'/',
	async (req, res) => {
		const parseResult = dtos.GetUserQuery.safeParse(req.query)
		if (!parseResult.success) {
			res.status(422).json({ error: parseResult.error.errors })
			return
		}
		const result = await usersController.getByUsername({ query: parseResult.data })
		res.status(result.statusCode ?? 200)
		if (result.headers) res.set(result.headers)
		if ('json' in result) res.json(result.json)
		else res.send(result.body)
	},
)

// POST /users
router.post(
	'/',
	async (req, res) => {
		const parseResult = dtos.UserCredentials.safeParse(req.body)
		if (!parseResult.success) {
			res.status(422).json({ error: parseResult.error.errors })
			return
		}
		const result = await usersController.create({ body: parseResult.data })
		res.status(result.statusCode ?? 200)
		if (result.headers) res.set(result.headers)
		if ('json' in result) res.json(result.json)
		else res.send(result.body)
	},
)

// POST /users/token
router.post(
	'/token',
	async (req, res) => {
		const parseResult = dtos.LoginUserRequest.safeParse(req.body)
		if (!parseResult.success) {
			res.status(422).json({ error: parseResult.error.errors })
			return
		}
		const result = await usersController.login({ body: parseResult.data })
		res.status(result.statusCode ?? 200)
		if (result.headers) res.set(result.headers)
		if ('json' in result) res.json(result.json)
		else res.send(result.body)
	},
)

// PATCH /users
router.patch(
	'/',
	jwtMiddleware(),
	async (req, res) => {
		const parseResult = dtos.UserUpdate.safeParse(req.body)
		if (!parseResult.success) {
			res.status(422).json({ error: parseResult.error.errors })
			return
		}
		const { userId } = req.jwtPayload!
		const result = await usersController.update({ userId, body: parseResult.data })
		res.status(result.statusCode ?? 200)
		if (result.headers) res.set(result.headers)
		if ('json' in result) res.json(result.json)
		else res.send(result.body)
	},
)

// GET /users/me
router.get(
	'/me',
	jwtMiddleware(),
	async (req, res) => {
		const { userId } = req.jwtPayload!
		const result = await usersController.getMe({ userId })
		res.status(result.statusCode ?? 200)
		if (result.headers) res.set(result.headers)
		if ('json' in result) res.json(result.json)
		else res.send(result.body)
	},
)

export default router
