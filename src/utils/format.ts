export const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v ?? 0)

export const formatDate = (d?: string | null) => {
  if (!d) return '-'
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')
}

export const formatDateTime = (d?: string | null) => {
  if (!d) return '-'
  return new Date(d).toLocaleString('pt-BR')
}

export const isOverdue = (dueDate: string, status: string) => {
  if (status === 'pago' || status === 'recebido' || status === 'cancelado') return false
  return new Date(dueDate) < new Date()
}
