import { Router } from 'express'
import { jwtMiddleware } from '~/presentation/http/express/middlewares/jwt'
import { JWTDecodedPayload } from '~/presentation/http/types'
import * as dtos from '~/presentation/http/dtos/documents'
import * as documentsController from '~/presentation/http/controllers/documents'
import { validateRequest } from 'zod-express-middleware'

const router = Router()
export const documentsRouter = router

// POST /documents
router.post(
	'/',
	jwtMiddleware(),
	validateRequest({ body: dtos.DocumentCreate }),
	async (req, res) => {
		// @ts-ignore
		const { userId } = req.jwtPayload as JWTDecodedPayload
		const result = await documentsController.create({ userId, body: req.body })
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
	validateRequest({ params: dtos.DocumentPatchParams, body: dtos.DocumentPatch }),
	async (req, res) => {
		// @ts-ignore
		const { userId } = req.jwtPayload as JWTDecodedPayload
		const result = await documentsController.patch({ userId, params: req.params, body: req.body })
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
	validateRequest({ params: dtos.GetDocumentByIdParams }),
	async (req, res) => {
		// @ts-ignore
		const { userId } = req.jwtPayload as JWTDecodedPayload
		const result = await documentsController.getById({ userId, params: req.params })
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
	validateRequest({ query: dtos.SearchDocumentsQuery }),
	async (req, res) => {
		// @ts-ignore
		const { userId } = req.jwtPayload as JWTDecodedPayload
		const result = await documentsController.search({
			userId,
			// @ts-ignore
			query: req.query,
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
	validateRequest({ params: dtos.GetDocumentAccessListParams }),
	async (req, res) => {
		// @ts-ignore
		const { userId } = req.jwtPayload as JWTDecodedPayload
		const result = await documentsController.getAccessList({ userId, params: req.params })
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
	validateRequest({ params: dtos.PatchDocumentAccessParams, body: dtos.PatchDocumentAccessRequest }),
	async (req, res) => {
		// @ts-ignore
		const { userId } = req.jwtPayload as JWTDecodedPayload
		const result = await documentsController.patchAccess({ userId, params: req.params, body: req.body })
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
	validateRequest({ params: dtos.CreateDocumentLinkParams }),
	async (req, res) => {
		// @ts-ignore
		const { userId } = req.jwtPayload as JWTDecodedPayload
		const origin = req.get('origin') || ''
		const result = await documentsController.createLink({ userId, params: req.params, origin })
		res.status(result.statusCode ?? 200)
		if (result.headers) res.set(result.headers)
		if ('json' in result) res.json(result.json)
		else res.send(result.body)
	},
)

// GET /documents/download/:filename
router.get(
	'/download/:filename',
	validateRequest({ params: dtos.DownloadDocumentByLinkParams }),
	async (req, res) => {
		const result = await documentsController.downloadByLink({ params: req.params })
		res.status(result.statusCode ?? 200)
		if (result.headers) res.set(result.headers)
		if ('json' in result) res.json(result.json)
		else res.send(result.body)
	},
)

export default router
