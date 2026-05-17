export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiError {
  error: string
  message?: string
  statusCode?: number
}

export type Status = 'ativo' | 'inativo'
