import { Router } from 'express'
import { jwtMiddleware } from '~/presentation/http/express/middlewares/jwt'
import { JWTDecodedPayload } from '~/presentation/http/types'
import * as dtos from '~/presentation/http/dtos/documents'
import * as documentsController from '~/presentation/http/controllers/documents'

const router = Router()
export const documentsRouter = router

// POST /documents
router.post(
	'/',
	jwtMiddleware(),
	async (req, res) => {
		const parseResult = dtos.DocumentCreate.safeParse(req.body)
		if (!parseResult.success) {
			res.status(422).json({ error: parseResult.error.errors })
			return
		}
		const { userId } = req.jwtPayload!
		const result = await documentsController.create({ userId, body: parseResult.data })
		res.status(result.statusCode ?? 200)
		if (result.headers) res.set(result.headers)
		if ('json' in result) res.json(result.json)
		else res.send(result.body)
	},
)

// PATCH /documents/:id
router.patch(
	'/:id',
	jwtMiddleware(),
	async (req, res) => {
		const paramsResult = dtos.DocumentPatchParams.safeParse(req.params)
		if (!paramsResult.success) {
			res.status(422).json({ error: paramsResult.error.errors })
			return
		}
		const bodyResult = dtos.DocumentPatch.safeParse(req.body)
		if (!bodyResult.success) {
			res.status(422).json({ error: bodyResult.error.errors })
			return
		}
		const { userId } = req.jwtPayload!
		const result = await documentsController.patch({ userId, params: paramsResult.data, body: bodyResult.data })
		res.status(result.statusCode ?? 200)
		if (result.headers) res.set(result.headers)
		if ('json' in result) res.json(result.json)
		else res.send(result.body)
	},
)

// GET /documents/:id
router.get(
	'/:id',
	jwtMiddleware(),
	async (req, res) => {
		const paramsResult = dtos.GetDocumentByIdParams.safeParse(req.params)
		if (!paramsResult.success) {
			res.status(422).json({ error: paramsResult.error.errors })
			return
		}
		const { userId } = req.jwtPayload!
		const result = await documentsController.getById({ userId, params: paramsResult.data })
		res.status(result.statusCode ?? 200)
		if (result.headers) res.set(result.headers)
		if ('json' in result) res.json(result.json)
		else res.send(result.body)
	},
)

// GET /documents
router.get(
	'/',
	jwtMiddleware(),
	async (req, res) => {
		const queryResult = dtos.SearchDocumentsQuery.safeParse(req.query)
		if (!queryResult.success) {
			res.status(422).json({ error: queryResult.error.errors })
			return
		}
		const { userId } = req.jwtPayload!
		const result = await documentsController.search({
			userId,
			query: queryResult.data,
		})
		res.status(result.statusCode ?? 200)
		if (result.headers) res.set(result.headers)
		if ('json' in result) res.json(result.json)
		else res.send(result.body)
	},
)

// GET /documents/:documentId/access
router.get(
	'/:documentId/access',
	jwtMiddleware(),
	async (req, res) => {
		const paramsResult = dtos.GetDocumentAccessListParams.safeParse(req.params)
		if (!paramsResult.success) {
			res.status(422).json({ error: paramsResult.error.errors })
			return
		}
		const { userId } = req.jwtPayload!
		const result = await documentsController.getAccessList({ userId, params: paramsResult.data })
		res.status(result.statusCode ?? 200)
		if (result.headers) res.set(result.headers)
		if ('json' in result) res.json(result.json)
		else res.send(result.body)
	},
)

// PATCH /documents/:documentId/access
router.patch(
	'/:documentId/access',
	jwtMiddleware(),
	async (req, res) => {
		const paramsResult = dtos.PatchDocumentAccessParams.safeParse(req.params)
		if (!paramsResult.success) {
			res.status(422).json({ error: paramsResult.error.errors })
			return
		}
		const bodyResult = dtos.PatchDocumentAccessRequest.safeParse(req.body)
		if (!bodyResult.success) {
			res.status(422).json({ error: bodyResult.error.errors })
			return
		}
		const { userId } = req.jwtPayload!
		const result = await documentsController.patchAccess({ userId, params: paramsResult.data, body: bodyResult.data })
		res.status(result.statusCode ?? 200)
		if (result.headers) res.set(result.headers)
		if ('json' in result) res.json(result.json)
		else res.send(result.body)
	},
)

// POST /documents/:documentId/link
router.post(
	'/:documentId/link',
	jwtMiddleware(),
	async (req, res) => {
		const paramsResult = dtos.CreateDocumentLinkParams.safeParse(req.params)
		if (!paramsResult.success) {
			res.status(422).json({ error: paramsResult.error.errors })
			return
		}
		const { userId } = req.jwtPayload!
		const origin = req.get('origin') || ''
		const result = await documentsController.createLink({ userId, params: paramsResult.data, origin })
		res.status(result.statusCode ?? 200)
		if (result.headers) res.set(result.headers)
		if ('json' in result) res.json(result.json)
		else res.send(result.body)
	},
)

// GET /documents/download/:filename
router.get(
	'/download/:filename',
	async (req, res) => {
		const paramsResult = dtos.DownloadDocumentByLinkParams.safeParse(req.params)
		if (!paramsResult.success) {
			res.status(422).json({ error: paramsResult.error.errors })
			return
		}
		const result = await documentsController.downloadByLink({ params: paramsResult.data })
		res.status(result.statusCode ?? 200)
		if (result.headers) res.set(result.headers)
		if ('json' in result) res.json(result.json)
		else res.send(result.body)
	},
)

export default router
