import { Router } from 'express'
import { usersController } from '~/presentation/controllers/users.controller'
import { jwtMiddleware } from '~/presentation/middlewares/jwt'

export const usersRouter = Router()

usersRouter.post('/', usersController.create)
usersRouter.get('/', usersController.getByUsername)
usersRouter.post('/token', usersController.login)
usersRouter.patch('/', jwtMiddleware(), usersController.update)
usersRouter.get('/me', jwtMiddleware(), usersController.getMe)
