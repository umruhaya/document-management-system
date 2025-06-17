import { createRouter } from '~/lib/create-app'
import { searchDocuments } from './documents.get'
import { getDocumentById } from './documents.id.get'
import { getDocumentAccessList } from './documents.access.get'
import { patchDocumentAccess } from './documents.access.patch'
import { createDocumentLink } from './documents.link.post'
import { downloadDocumentByLink } from './documents.download.get'
import { createDocument } from './documents.post'

export const documentsRouter = createRouter()
	.openapi(...searchDocuments)
	.openapi(...getDocumentById)
	.openapi(...createDocument)
	.openapi(...getDocumentAccessList)
	.openapi(...patchDocumentAccess)
	.openapi(...createDocumentLink)
	.openapi(...downloadDocumentByLink)
