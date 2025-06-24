import { Router } from 'express'
import * as documentsController from '~/presentation/http/controllers/documents'
import { jwtMiddleware } from '~/presentation/http/express/middlewares/jwt'

const router = Router()
export const documentsRouter = router

// POST /documents
router.post('/', jwtMiddleware(), async (req, res) => {
	if (!req.jwtPayload) {
		res.status(500).send('Internal Server Error')
		return
	}
	const { userId } = req.jwtPayload
	const result = await documentsController.create({ userId, body: req.body })
	res.status(result.statusCode ?? 200)
	if (result.headers) res.set(result.headers)
	if ('json' in result) res.json(result.json)
	else res.send(result.body)
})

// PATCH /documents/:id
router.patch('/:id', jwtMiddleware(), async (req, res) => {
	if (!req.jwtPayload) {
		res.status(500).send('Internal Server Error')
		return
	}
	const { userId } = req.jwtPayload
	const result = await documentsController.patch({ userId, params: req.params, body: req.body })
	res.status(result.statusCode ?? 200)
	if (result.headers) res.set(result.headers)
	if ('json' in result) res.json(result.json)
	else res.send(result.body)
})

// GET /documents/:id
router.get('/:id', jwtMiddleware(), async (req, res) => {
	if (!req.jwtPayload) {
		res.status(500).send('Internal Server Error')
		return
	}
	const { userId } = req.jwtPayload
	const result = await documentsController.getById({ userId, params: req.params })
	res.status(result.statusCode ?? 200)
	if (result.headers) res.set(result.headers)
	if ('json' in result) res.json(result.json)
	else res.send(result.body)
})

// GET /documents
router.get('/', jwtMiddleware(), async (req, res) => {
	if (!req.jwtPayload) {
		res.status(500).send('Internal Server Error')
		return
	}
	const { userId } = req.jwtPayload
	const result = await documentsController.search({
		userId,
		query: req.query,
	})
	res.status(result.statusCode ?? 200)
	if (result.headers) res.set(result.headers)
	if ('json' in result) res.json(result.json)
	else res.send(result.body)
})

// GET /documents/:documentId/access
router.get('/:documentId/access', jwtMiddleware(), async (req, res) => {
	if (!req.jwtPayload) {
		res.status(500).send('Internal Server Error')
		return
	}
	const { userId } = req.jwtPayload
	const result = await documentsController.getAccessList({ userId, params: req.params })
	res.status(result.statusCode ?? 200)
	if (result.headers) res.set(result.headers)
	if ('json' in result) res.json(result.json)
	else res.send(result.body)
})

// PATCH /documents/:documentId/access
router.patch('/:documentId/access', jwtMiddleware(), async (req, res) => {
	if (!req.jwtPayload) {
		res.status(500).send('Internal Server Error')
		return
	}
	const { userId } = req.jwtPayload
	const result = await documentsController.patchAccess({ userId, params: req.params, body: req.body })
	res.status(result.statusCode ?? 200)
	if (result.headers) res.set(result.headers)
	if ('json' in result) res.json(result.json)
	else res.send(result.body)
})

// POST /documents/:documentId/link
router.post('/:documentId/link', jwtMiddleware(), async (req, res) => {
	if (!req.jwtPayload) {
		res.status(500).send('Internal Server Error')
		return
	}
	const { userId } = req.jwtPayload
	const origin = req.get('origin') || ''
	const result = await documentsController.createLink({ userId, params: req.params, origin })
	res.status(result.statusCode ?? 200)
	if (result.headers) res.set(result.headers)
	if ('json' in result) res.json(result.json)
	else res.send(result.body)
})

// GET /documents/download/:filename
router.get('/download/:filename', async (req, res) => {
	const result = await documentsController.downloadByLink({ params: req.params })
	res.status(result.statusCode ?? 200)
	if (result.headers) res.set(result.headers)
	if ('json' in result) res.json(result.json)
	else res.send(result.body)
})

export default router
