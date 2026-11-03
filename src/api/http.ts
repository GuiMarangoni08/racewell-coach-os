import type { CoachTransport, CoachTransportOptions } from './types.ts'
import { organizationStorage } from './session.ts'

export class ApiError extends Error {
  readonly status: number
  readonly code?: string
  readonly details?: unknown

  constructor(message: string, status = 0, code?: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }

  get isConflict(): boolean {
    return this.status === 409 || this.code === 'VERSION_CONFLICT' || this.code === 'IDEMPOTENCY_CONFLICT' || this.code === 'ALREADY_PUBLISHED'
  }
}

const TOKEN_KEY = 'racewell.coach.access_token'
let inMemoryToken: string | null = null

export const tokenStorage = {
  get(): string | null {
    if (inMemoryToken) return inMemoryToken
    if (typeof window === 'undefined') return null
    try {
      return window.sessionStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },
  set(token: string): void {
    inMemoryToken = token
    if (typeof window === 'undefined') return
    try {
      window.sessionStorage.setItem(TOKEN_KEY, token)
    } catch {
      // A memória da sessão ainda mantém o token durante a página atual.
    }
  },
  clear(): void {
    inMemoryToken = null
    if (typeof window === 'undefined') return
    try {
      window.sessionStorage.removeItem(TOKEN_KEY)
    } catch {
      // O logout local continua removendo o token em memória.
    }
  },
}

function apiBaseUrl(): string {
  return (import.meta.env?.VITE_API_URL ?? '').trim().replace(/\/+$/, '')
}

function messageFrom(payload: unknown, fallback: string): { message: string; code?: string } {
  if (payload !== null && typeof payload === 'object' && !Array.isArray(payload)) {
    const body = payload as Record<string, unknown>
    const message = [body.message, body.detail, body.error]
      .find((candidate): candidate is string => typeof candidate === 'string' && candidate.trim().length > 0)
    const code = typeof body.code === 'string' ? body.code : undefined
    return { message: message?.trim() ?? fallback, code }
  }
  if (typeof payload === 'string' && payload.trim()) return { message: payload.trim() }
  return { message: fallback }
}

export function createHttpTransport(getBaseUrl: () => string = apiBaseUrl, fetcher: typeof fetch = fetch): CoachTransport {
 return async (path: string, options: CoachTransportOptions = {}) => {
  const base = getBaseUrl().trim().replace(/\/+$/, '')
  if (!base) {
    throw new ApiError('VITE_API_URL não está configurada. Configure a URL da API no ambiente local.', 0, 'configuration')
  }

  const headers = new Headers({ Accept: 'application/json', ...options.headers })
  const token = tokenStorage.get()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (path.startsWith('/coach/v1/') && path.split('?')[0] !== '/coach/v1/context') {
    const organizationId = organizationStorage.getActive()
    if (!organizationId) throw new ApiError('Selecione explicitamente uma organização antes de operar.', 0, 'organization_selection')
    headers.set('X-Organization-Id', organizationId)
  }
  if (options.body !== undefined) headers.set('Content-Type', 'application/json')

  let response: Response
  try {
    response = await fetcher(`${base}${path}`, {
      method: options.method ?? 'GET',
      headers,
      credentials: 'omit',
      ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
    })
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'falha de rede'
    throw new ApiError(`Não foi possível conectar à API: ${detail}`, 0, 'network')
  }

  let payload: unknown = null
  if (response.status !== 204) {
    const raw = await response.text()
    if (raw) {
      try {
        payload = JSON.parse(raw) as unknown
      } catch {
        payload = raw
      }
    }
  }

  if (!response.ok) {
    if (response.status === 401 && token && tokenStorage.get() === token && path !== '/auth/login') {
      tokenStorage.clear()
      organizationStorage.clearActive()
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('racewell:unauthorized'))
    }
    const result = messageFrom(payload, `A API respondeu com HTTP ${response.status}.`)
    throw new ApiError(result.message, response.status, result.code, payload)
  }
  return payload
 }
}
export const httpTransport = createHttpTransport()

export function buildQuery(values: Record<string, string | number | undefined>): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== '') params.set(key, String(value))
  }
  const query = params.toString()
  return query ? `?${query}` : ''
}
