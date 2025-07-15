import { createExpressEndpoints, initServer } from '@ts-rest/express'
import express from 'express'
import { documentsContract } from '~/presentation/http/contracts/documents'
import { usersContract } from '~/presentation/http/contracts/users'
import { documentsController } from '~/presentation/http/controllers/documents.controller'
import { usersController } from '~/presentation/http/controllers/users.controller'
import { openapiDocument, swaggerHtml } from '~/presentation/http/openapi'

const app = express()

app.use(express.json())

app.use((req, _res, next) => {
	console.log(`[${req.method}] ${req.path}`)
	next()
})

app.get('/', (_, res) => {
	res.send(`<div><h1>DMS Server is Up</h1><a href='/docs'>View Docs</a></div>`)
})

app.get('/healthz', (_, res) => {
	res.send('Server Is Healthy\n')
})

// OpenAPI Setup
app.get('/docs', (_, res) => {
	res.send(swaggerHtml)
})

app.get('/docs.json', (_, res) => {
	res.json(openapiDocument)
})

// Registering with TS Rest
const s = initServer()

const usersRouter = s.router(usersContract, usersController)
const documentsRouter = s.router(documentsContract, documentsController)

createExpressEndpoints(usersContract, usersRouter, app)
createExpressEndpoints(documentsContract, documentsRouter, app)

export const expressApp = app
