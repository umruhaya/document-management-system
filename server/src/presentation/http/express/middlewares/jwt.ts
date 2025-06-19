import jwt from 'jsonwebtoken'
import { JWTContent, JWTDecodedPayload } from '../../types'
import { env } from '~/env'
import { NextFunction, Request, RequestHandler, Response } from 'express'
import { expressjwt } from 'express-jwt'

// Extend Express Response to type res.locals.user
declare module 'express-serve-static-core' {
	interface Locals {
		user?: JWTDecodedPayload
	}
}

export const sign = (payload: JWTContent) => {
	return jwt.sign(payload, env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '4h' })
}

export const jwtMiddleware = () => {
	return expressjwt({
		algorithms: ['HS256'],
		secret: env.JWT_SECRET,
		requestProperty: 'jwtPayload',
	})
}
