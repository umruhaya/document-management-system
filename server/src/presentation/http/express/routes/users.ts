import { Router } from 'express'
import { jwtMiddleware } from '~/presentation/http/express/middlewares/jwt'
import * as usersController from '~/presentation/http/controllers/users'

const router = Router()
export const usersRouter = router

// GET /users?username=...
router.get(
	'/',
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
	async (req, res) => {
		const { userId } = req.jwtPayload!
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
		const { userId } = req.jwtPayload!
		const result = await usersController.getMe({ userId })
		res.status(result.statusCode ?? 200)
		if (result.headers) res.set(result.headers)
		if ('json' in result) res.json(result.json)
		else res.send(result.body)
	},
)

export default router
