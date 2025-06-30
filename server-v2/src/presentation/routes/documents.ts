import { Router } from 'express'
import { documentsController } from '~/presentation/controllers/documents.controller'
import { jwtMiddleware } from '~/presentation/middlewares/jwt'

export const documentsRouter = Router()

documentsRouter.post('/', jwtMiddleware(), documentsController.create)

// documentsRouter.get('/', jwtMiddleware(), documentsController.search)

documentsRouter.get('/:id', jwtMiddleware(), documentsController.getById)

documentsRouter.patch('/:id', jwtMiddleware(), documentsController.update)

// documentsRouter.get('/:documentId/access', jwtMiddleware(), documentsController.getAccessList)

// documentsRouter.patch('/:documentId/access', jwtMiddleware(), documentsController.patchAccess)

// documentsRouter.post('/:documentId/link', jwtMiddleware(), documentsController.createLink)

// documentsRouter.get('/download/:filename', jwtMiddleware(), documentsController.downloadByLink)
