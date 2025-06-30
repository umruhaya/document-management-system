import { Router } from 'express'
import { usersController } from '~/presentation/controllers/users.controller'
import { jwtMiddleware } from '~/presentation/middlewares/jwt'

export const usersRouter = Router()

usersRouter.get('/', usersController.getByUsername)
usersRouter.post('/', usersController.create)
usersRouter.patch('/', usersController.update)
usersRouter.post('/token', usersController.login)
usersRouter.get('/me', jwtMiddleware(), usersController.getMe)
