import { createContext, useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { api } from '@/services/api'
import type { LoginCredentials, User } from '@/types/auth'

interface AuthContextData {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('@finance:accessToken')
    if (!token) {
      setIsLoading(false)
      return
    }

    api
      .get<User>('/auth/me')
      .then(({ data }) => setUser(data))
      .catch(() => {
        localStorage.removeItem('@finance:accessToken')
        localStorage.removeItem('@finance:refreshToken')
      })
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    const { data } = await api.post('/auth/login', credentials)
    localStorage.setItem('@finance:accessToken', data.tokens.accessToken)
    localStorage.setItem('@finance:refreshToken', data.tokens.refreshToken)
    setUser(data.user)
  }, [])

  const logout = useCallback(() => {
    const refreshToken = localStorage.getItem('@finance:refreshToken')
    if (refreshToken) {
      api.post('/auth/logout', { refreshToken }).catch(() => null)
    }
    localStorage.removeItem('@finance:accessToken')
    localStorage.removeItem('@finance:refreshToken')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
