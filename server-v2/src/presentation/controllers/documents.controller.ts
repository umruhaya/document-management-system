import { matchRes } from '@carbonteq/fp'
import type { Request, Response } from 'express'
import { DocumentService } from '~/app/services/document.service'
import { DocumentRepositoryPg } from '~/domain/document/document.repository.pg'
import * as dtos from '~/presentation/dtos/documents'
import { mapEntityErrorToStatusCode } from '~/presentation/utils/http-error-mapper'

const documentService = new DocumentService(new DocumentRepositoryPg())

export const documentsController = {
	async getById(req: Request, res: Response) {
		const { data, success, error } = dtos.GetDocumentByIdParams.safeParse(req.params)
		if (!success) {
			res.status(422).json(error.message)
			return
		}
		const documentId = data.id
		const result = await documentService.getById(documentId)
		matchRes(result, {
			Ok: (doc) => res.json(doc),
			Err: (err) => res.status(mapEntityErrorToStatusCode(err)).json({ error: err.message }),
		})
	},

	async create(req: Request, res: Response) {
		const { data, success, error } = dtos.DocumentCreate.safeParse(req.body)
		if (!success) {
			res.status(422).json(error.message)
			return
		}
		const result = await documentService.create(data)
		matchRes(result, {
			Ok: (doc) => res.status(201).json(doc),
			Err: (err) => res.status(mapEntityErrorToStatusCode(err)).json({ error: err.message }),
		})
	},

	async update(req: Request, res: Response) {
		const document = req.body
		const result = await documentService.update(document)
		matchRes(result, {
			Ok: () => res.status(204).send(),
			Err: (err) => res.status(mapEntityErrorToStatusCode(err)).json({ error: err.message }),
		})
	},
}
