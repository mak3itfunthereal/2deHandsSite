export class ApiError extends Error {
  readonly status: number
  readonly responseBody: string

  constructor(status: number, responseBody: string) {
    super(`API request failed with status ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.responseBody = responseBody
  }
}

type GetOptions = Omit<RequestInit, 'method' | 'body'>

export function createApiClient(baseUrl: string, fetchRequest: typeof fetch = fetch) {
  const base = baseUrl.replace(/\/+$/, '')

  async function request(path: string, options: RequestInit = {}): Promise<unknown> {
    if (!path || path.startsWith('/') || path.split('/').some((part) => part === '..')) {
      throw new Error('API paths must be relative to the API base URL')
    }

    const headers = new Headers(options.headers)
    if (!headers.has('Accept')) {
      headers.set('Accept', 'application/json')
    }

    const response = await fetchRequest(`${base}/${path}`, { ...options, headers })
    const body = await response.text()

    if (!response.ok) {
      throw new ApiError(response.status, body)
    }

    if (!body.trim()) {
      return undefined
    }

    try {
      return JSON.parse(body) as unknown
    } catch {
      throw new Error('API returned an invalid JSON response')
    }
  }

  return {
    request,
    getAccounts: (options?: GetOptions) => request('accounts', { ...options, method: 'GET' }),
    getProducts: (options?: GetOptions) => request('products', { ...options, method: 'GET' }),
    getInfo: (options?: GetOptions) => request('info', { ...options, method: 'GET' }),
  }
}
