import { matchRes } from '@carbonteq/fp'
import type { Request, Response } from 'express'
import mime from 'mime'
import { DocumentService } from '~/app/services/document.service'
import { AclRepositoryPg } from '~/domain/access-control-entry/acl.repository.pg'
import { DocumentRepositoryPg } from '~/domain/document/document.repository.pg'
import * as dtos from '~/presentation/dtos/documents'
import type { JWTDecodedPayload } from '~/presentation/types'
import { mapEntityErrorToStatusCode } from '~/presentation/utils/http-error-mapper'

const documentService = new DocumentService(new DocumentRepositoryPg(), new AclRepositoryPg())

type AuthRequest = Request & { jwtPayload: JWTDecodedPayload }

export const documentsController = {
	async getById(req: Request, res: Response) {
		const { userId } = (req as AuthRequest).jwtPayload
		const { data, success, error } = dtos.GetDocumentByIdParams.safeParse(req.params)
		if (!success) {
			res.status(422).json(error.message)
			return
		}
		const documentId = data.id
		const result = await documentService.getById(userId, documentId)
		matchRes(result, {
			Ok: (doc) => res.json(doc),
			Err: (err) => res.status(mapEntityErrorToStatusCode(err)).json({ error: err.message }),
		})
	},

	async search(req: Request, res: Response) {
		const { userId } = (req as AuthRequest).jwtPayload
		const { data: query, success, error } = dtos.SearchDocumentsQuery.safeParse(req.query)
		if (!success) {
			res.status(422).json(error.message)
			return
		}
		const result = await documentService.search(userId, {
			page: query.page,
			limit: query.limit,
			sort: query.sort,
			filters: { ...query },
		})
		matchRes(result, {
			Ok: (doc) => res.json(doc),
			Err: (err) => res.status(mapEntityErrorToStatusCode(err)).json({ error: err.message }),
		})
	},

	async create(req: Request, res: Response) {
		const { userId } = (req as AuthRequest).jwtPayload
		const { data, success, error } = dtos.DocumentCreate.safeParse(req.body)
		if (!success) {
			res.status(422).json(error.message)
			return
		}
		const result = await documentService.create(userId, data)
		matchRes(result, {
			Ok: (doc) => res.status(201).json(doc),
			Err: (err) => res.status(mapEntityErrorToStatusCode(err)).json({ error: err.message }),
		})
	},

	async update(req: Request, res: Response) {
		const document = req.body
		const { userId } = (req as AuthRequest).jwtPayload
		const result = await documentService.update(userId, document)
		matchRes(result, {
			Ok: () => res.status(204).send(),
			Err: (err) => res.status(mapEntityErrorToStatusCode(err)).json({ error: err.message }),
		})
	},

	async getAccessList(req: Request, res: Response) {
		const { data: params, success, error } = dtos.GetDocumentAccessListParams.safeParse(req.params)
		if (!success) {
			res.status(422).json(error.message)
			return
		}
		const result = await documentService.getAclEntries(params.documentId)
		matchRes(result, {
			Ok: (entries) => res.status(200).json({ access: entries }),
			Err: (err) => res.status(mapEntityErrorToStatusCode(err)).json({ error: err.message }),
		})
	},

	async patchAccess(req: Request, res: Response) {
		const {
			data: params,
			success: paramSuccess,
			error: paramError,
		} = dtos.PatchDocumentAccessParams.safeParse(req.params)
		if (!paramSuccess) {
			res.status(422).json(paramError.message)
			return
		}
		const { data: body, success: bodySuccess, error: bodyError } = dtos.PatchDocumentAccessRequest.safeParse(req.body)
		if (!bodySuccess) {
			res.status(422).json(bodyError.message)
			return
		}
		const action = body.remove ? ({ remove: true } as const) : ({ remove: false, role: body.role } as const)
		const result = await documentService.updateAcl(body.targetUserId, params.documentId, action)
		matchRes(result, {
			Ok: () => res.status(204).send(),
			Err: (err) => res.status(mapEntityErrorToStatusCode(err)).json({ error: err.message }),
		})
	},

	async createLink(req: Request, res: Response): Promise<void> {
		const { userId } = (req as AuthRequest).jwtPayload
		const { data: params, success, error } = dtos.CreateDocumentLinkParams.safeParse(req.params)
		if (!success) {
			res.status(422).json(error.message)
			return
		}
		const result = await documentService.createLink(userId, {
			baseUrl: `${req.host}/documents/download`,
			documentId: params.documentId,
			expiresAt: Date.now() + 2 * 60 * 60 * 1000,
			method: 'get',
		})
		matchRes(result, {
			Ok: (link) => res.status(201).json({ link }),
			Err: (err) => res.status(mapEntityErrorToStatusCode(err)).json({ error: err.message }),
		})
	},

	async downloadByLink(req: Request, res: Response): Promise<void> {
		const { data: query, success, error } = dtos.DownloadDocumentByLinkQuery.safeParse(req.query)
		if (!success) {
			res.status(422).json(error.message)
			return
		}
		const result = await documentService.getDocumentByLink(query)
		matchRes(result, {
			Ok: (doc) => {
				const fileExtension = mime.getExtension(doc.fileType) ?? 'bin'
				const headers = {
					'Content-Disposition': `attachment; filename="${doc.title}.${fileExtension}"`,
					'Content-Type': doc.fileType ?? 'text/plain',
				}
				res.set(headers)
				res.send(doc.content)
			},
			Err: (err) => res.status(mapEntityErrorToStatusCode(err)).json({ error: err.message }),
		})
	},
}
