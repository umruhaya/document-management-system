import jwt from 'jsonwebtoken'
import { env } from '~/infra/env'
import type { JWTContent, JWTDecodedPayload } from '~/presentation/types'

export class JWTService {
	static sign(payload: JWTContent): string {
		return jwt.sign(payload, env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '4h' })
	}

	static decode(token: string): JWTDecodedPayload | null {
		try {
			return jwt.verify(token, env.JWT_SECRET) as JWTDecodedPayload
		} catch {
			return null
		}
	}
}
