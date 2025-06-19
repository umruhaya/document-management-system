import { OpenApiGeneratorV31, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import * as usersRoutes from './users'
import * as documentsRoutes from './documents'
import { SwaggerUI } from '@hono/swagger-ui'

const registry = new OpenAPIRegistry()

// Security Schemas
registry.registerComponent('securitySchemes', 'jwt', {
	type: 'http',
	scheme: 'bearer',
	description: 'JSON Web Token',
	bearerFormat: 'JWT',
})

// Users
registry.registerPath(usersRoutes.createUser)
registry.registerPath(usersRoutes.updateUser)
registry.registerPath(usersRoutes.loginUser)
registry.registerPath(usersRoutes.getMyDetails)
registry.registerPath(usersRoutes.getUserByUsername)

// Documents
registry.registerPath(documentsRoutes.createDocument)
registry.registerPath(documentsRoutes.patchDocument)
registry.registerPath(documentsRoutes.getDocumentById)
registry.registerPath(documentsRoutes.searchDocuments)
registry.registerPath(documentsRoutes.getDocumentAccessList)
registry.registerPath(documentsRoutes.patchDocumentAccess)
registry.registerPath(documentsRoutes.createDocumentLink)
registry.registerPath(documentsRoutes.downloadDocumentByLink)

const generator = new OpenApiGeneratorV31(registry.definitions)

export const openapiDocument = generator.generateDocument({
	openapi: '3.0.0',
	info: {
		title: 'Document Management System',
		description: 'DMS APIs',
		version: '0.0.0',
	},
})

const title = openapiDocument.info.title
export const swaggerHtml = `<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="SwaggerUI" />
    <title>${title}</title>
</head>
    <body>
        ${SwaggerUI({ title, url: '/docs.json', persistAuthorization: true })}
    </body>
</html>`
