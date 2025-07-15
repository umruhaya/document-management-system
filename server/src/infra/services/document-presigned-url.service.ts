import crypto from 'node:crypto'
import { env } from '~/infra/env'
import logger from '~/infra/logger'
/**
 * Options for generating a presigned document URL.
 */
export interface PresignOptions {
	/** Unique document identifier */
	documentId: string
	/** HTTP method to permit (e.g., 'GET', 'POST') */
	method: string
	/** Expiry time as a UNIX timestamp (seconds) */
	expiresAt: number
	/** The base URL (endpoint) of your API to access the document */
	baseUrl: string
}

/**
 * Parameters for verifying a presigned document URL.
 */
export interface VerificationInput {
	/** Unique document identifier */
	documentId: string
	/** HTTP method expected */
	method: string
	/** Expiry time as a UNIX timestamp (seconds) */
	expiresAt: number
	/** Signature from the URL */
	signature: string
}

/**
 * Service for generating and verifying stateless presigned URLs for documents.
 * Inspired by AWS S3 presigned URLs.
 */
export class DocumentPresignedUrlService {
	/**
	 * generate a presigned URL for a document and HTTP method, with expiry.
	 *
	 * @param {PresignOptions} options - Options for signing, including documentId, method, expiry, and baseUrl.
	 * @returns {string} The presigned URL containing all necessary query parameters.
	 */
	public static presignUrl(options: PresignOptions): string {
		const payload = DocumentPresignedUrlService.payloadString(options.documentId, options.method, options.expiresAt)
		const signature = DocumentPresignedUrlService.signPayload(payload)

		const params = new URLSearchParams({
			documentId: options.documentId,
			method: options.method,
			expiresAt: options.expiresAt.toString(),
			signature,
		})

		return `${options.baseUrl}?${params.toString()}`
	}

	/**
	 * Verifies a presigned URL's query parameters (documentId, method, expiresAt, signature).
	 * Returns true if the signature is valid and not expired.
	 *
	 * @param {VerificationInput} input - The query parameters to verify.
	 * @returns {boolean} True if the signature is authentic and not expired, false otherwise.
	 */
	public static verifySignature(input: VerificationInput): boolean {
		if (!input.documentId || !input.method || !input.expiresAt || !input.signature) {
			return false
		}

		// Expiry validation
		const now = Math.floor(Date.now() / 1000)
		if (Number(input.expiresAt) < now) {
			return false
		}

		// Recompute signature from input
		const payload = DocumentPresignedUrlService.payloadString(input.documentId, input.method, input.expiresAt)
		const expectedSignature = DocumentPresignedUrlService.signPayload(payload)

		try {
			return crypto.timingSafeEqual(Buffer.from(input.signature), Buffer.from(expectedSignature))
		} catch (error) {
			logger.warn('Error verifying presigned URL signature', { error, input })
			return false
		}
	}

	/**
	 * Composes a canonical payload string from document details.
	 * Fields must be in the same order for signing/verifying.
	 *
	 * @private
	 * @param {string} documentId - The document identifier.
	 * @param {string} method - HTTP method.
	 * @param {number} expiresAt - Expiry unix timestamp (seconds).
	 * @returns {string} Canonicalized string to sign or verify.
	 */
	private static payloadString(documentId: string, method: string, expiresAt: number): string {
		return `${documentId}:${method.toUpperCase()}:${expiresAt}`
	}

	/**
	 * Computes an HMAC SHA-256 signature for a given payload.
	 *
	 * @private
	 * @param {string} payload - The canonical string to sign.
	 * @returns {string} Hex-encoded signature.
	 */
	private static signPayload(payload: string): string {
		return crypto.createHmac('sha256', env.HMAC_SIGNING_KEY).update(payload).digest('hex')
	}
}
