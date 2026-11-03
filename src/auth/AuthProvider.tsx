import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { coachRepository } from '@/api/coachRepository'
import { readAccessToken } from '@/api/adapters'
import { ApiError, tokenStorage } from '@/api/http'
import { organizationStorage } from '@/api/session'
import type { AuthUser } from '@/api/types'

type AuthStatus = 'loading' | 'authenticated' | 'anonymous' | 'error'

interface AuthContextValue {
  user: AuthUser | null
  status: AuthStatus
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  retryRestore: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [error, setError] = useState<string | null>(null)

  const restore = useCallback(async () => {
    setStatus('loading')
    setError(null)
    if (!tokenStorage.get()) {
      setUser(null)
      organizationStorage.clearActive()
      setStatus('anonymous')
      return
    }
    try {
      const restoredUser = await coachRepository.currentUser()
      setUser(restoredUser)
      setStatus('authenticated')
    } catch (cause) {
      setUser(null)
      if (cause instanceof ApiError && cause.status === 401) {
        tokenStorage.clear()
        setStatus('anonymous')
        return
      }
      setStatus('error')
      setError(cause instanceof Error ? cause.message : 'Não foi possível validar a sessão.')
    }
  }, [])

  useEffect(() => {
    void restore()
    const unauthorized = () => { setUser(null); setStatus('anonymous'); setError('Sessão expirada. Entre novamente.'); organizationStorage.clearActive() }
    window.addEventListener('racewell:unauthorized', unauthorized)
    return () => window.removeEventListener('racewell:unauthorized', unauthorized)
  }, [restore])

  const login = useCallback(async (email: string, password: string) => {
    setError(null)
    try {
      const response = await coachRepository.login(email, password)
      const token = readAccessToken(response)
      if (!token) throw new Error('O login não retornou o token Bearer obrigatório.')
      organizationStorage.clearActive()
      tokenStorage.set(token)
      const authenticatedUser = await coachRepository.currentUser()
      setUser(authenticatedUser)
      setStatus('authenticated')
    } catch (cause) {
      tokenStorage.clear()
      organizationStorage.clearActive()
      setUser(null)
      setStatus('anonymous')
      const message = cause instanceof Error ? cause.message : 'Falha ao entrar.'
      setError(message)
      throw cause
    }
  }, [])

  const logout = useCallback(async () => {
    let failure: unknown
    try {
      await coachRepository.logout()
    } catch (cause) {
      failure = cause
    } finally {
      tokenStorage.clear()
      organizationStorage.clearActive()
      setUser(null)
      setStatus('anonymous')
      setError(null)
    }
    if (failure) throw failure
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    status,
    error,
    login,
    logout,
    retryRestore: restore,
  }), [user, status, error, login, logout, restore])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth deve ser usado dentro de AuthProvider.')
  return value
}
