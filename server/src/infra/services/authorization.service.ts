import jwt from 'jsonwebtoken'
import { env } from '~/infra/env'
import type { JWTContent, JWTDecodedPayload } from '~/presentation/types'
import logger from '~/infra/logger'

export class AuthorizationService {
	static getUserIdFromAuthHeader(authHeader: string | undefined): string | null {
		if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) return null
		const token = authHeader.slice(7)
		const payload = AuthorizationService.decode(token)
		return payload?.userId ?? null
	}

	static signPayload(payload: JWTContent): string {
		return jwt.sign(payload, env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '4h' })
	}

	private static decode(token: string): JWTDecodedPayload | null {
		try {
			return jwt.verify(token, env.JWT_SECRET) as JWTDecodedPayload
		} catch (error) {
			logger.warn('Failed to decode JWT token', { error, token })
			return null
		}
	}
}
