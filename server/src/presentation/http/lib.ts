type JsonResponse<T> = {
	statusCode: number
	json: T
	headers?: Record<string, string>
}

type BodyResponse<T> = {
	statusCode: number
	body: T
	headers?: Record<string, string>
}

type HttpResponse<T> = JsonResponse<T> | BodyResponse<T>

export const httpResponse = <T>(response: HttpResponse<T>) => response
