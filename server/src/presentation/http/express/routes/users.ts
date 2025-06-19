import { Router } from 'express'
import { jwtMiddleware } from '~/presentation/http/express/middlewares/jwt'
import { JWTDecodedPayload } from '~/presentation/http/types'
import * as dtos from '~/presentation/http/dtos/users'
import * as usersController from '~/presentation/http/controllers/users'
import { validateRequest } from 'zod-express-middleware'

const router = Router()
export const usersRouter = router

// GET /users?username=...
router.get(
	'/',
	validateRequest({ query: dtos.GetUserQuery }),
	async (req, res) => {
		const result = await usersController.getByUsername({ query: req.query })
		res.status(result.statusCode ?? 200)
		if (result.headers) res.set(result.headers)
		if ('json' in result) res.json(result.json)
		else res.send(result.body)
	},
)

// POST /users
router.post(
	'/',
	validateRequest({ body: dtos.UserCredentials }),
	async (req, res) => {
		const result = await usersController.create({ body: req.body })
		res.status(result.statusCode ?? 200)
		if (result.headers) res.set(result.headers)
		if ('json' in result) res.json(result.json)
		else res.send(result.body)
	},
)

// POST /users/token
router.post(
	'/token',
	validateRequest({ body: dtos.LoginUserRequest }),
	async (req, res) => {
		const result = await usersController.login({ body: req.body })
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
	validateRequest({ body: dtos.UserUpdate }),
	async (req, res) => {
		// @ts-ignore
		const { userId } = req.jwtPayload as JWTDecodedPayload
		const result = await usersController.update({ userId, body: req.body })
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
		// @ts-ignore
		const { userId } = req.jwtPayload as JWTDecodedPayload
		const result = await usersController.getMe({ userId })
		res.status(result.statusCode ?? 200)
		if (result.headers) res.set(result.headers)
		if ('json' in result) res.json(result.json)
		else res.send(result.body)
	},
)

export default router
