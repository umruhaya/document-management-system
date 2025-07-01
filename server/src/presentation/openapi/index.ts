import { SwaggerUI } from '@hono/swagger-ui'
import { initContract } from '@ts-rest/core'
import { generateOpenApi } from '@ts-rest/open-api'
import { documentsContract } from '~/presentation/contracts/documents'
import { usersContract } from '~/presentation/contracts/users'

const c = initContract()

const mainContract = c.router({
	users: usersContract,
	documents: documentsContract,
})

const hasSecurity = (metadata: unknown) => {
	return !!metadata && typeof metadata === 'object' && 'jwt' in metadata && metadata.jwt === true
}

export const openapiDocument = generateOpenApi(
	mainContract,
	{
		openapi: '3.0.0',
		info: {
			title: 'Document Management System',
			description: 'DMS APIs',
			version: '0.0.0',
		},
		components: {
			securitySchemes: {
				jwt: {
					type: 'http',
					scheme: 'bearer',
					description: 'JSON Web Token',
					bearerFormat: 'JWT',
				},
			},
		},
	},
	{
		setOperationId: true,
		operationMapper: (operation, appRoute) => ({
			...operation,
			security: hasSecurity(appRoute.metadata) ? [{ jwt: [] }] : undefined,
		}),
	},
)

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
