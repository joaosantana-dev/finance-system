export type UserRole = 'admin' | 'financeiro' | 'gestor' | 'rh' | 'visualizador'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  company_id: number
  company_name: string
  status: 'ativo' | 'inativo'
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginResponse {
  user: User
  tokens: AuthTokens
}
