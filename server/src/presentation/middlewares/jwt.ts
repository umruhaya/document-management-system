import { expressjwt } from 'express-jwt'
import jwt from 'jsonwebtoken'
import { env } from '~/infra/env'
import type { JWTContent, JWTDecodedPayload } from '~/presentation/types'

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

declare global {
	namespace Express {
		interface Request {
			jwtPayload?: JWTDecodedPayload // Make it optional if it might not always be present
		}
	}
}
