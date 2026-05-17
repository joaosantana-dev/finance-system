import { api } from './api'
import type { PaginatedResponse } from '@/types/common'
import type {
  DashboardSummary, MonthlyFlow, CategoryExpense,
  AccountPayable, AccountReceivable, Reimbursement,
  Company, CostCenter, Category, Client, Supplier,
  PaymentMethod, BankAccount, FinanceUser, AuditLog,
} from '@/types/finance'

// Dashboard
export const dashboardApi = {
  getSummary: () => api.get<DashboardSummary>('/dashboard/summary').then(r => r.data),
  getMonthlyFlow: () => api.get<MonthlyFlow[]>('/dashboard/monthly-flow').then(r => r.data),
  getExpensesByCategory: () => api.get<CategoryExpense[]>('/dashboard/expenses-by-category').then(r => r.data),
  getRecentTransactions: () => api.get<unknown[]>('/dashboard/recent-transactions').then(r => r.data),
}

// Helpers
const crud = <T>(path: string) => ({
  list: (params?: Record<string, unknown>) => api.get<PaginatedResponse<T>>(path, { params }).then(r => r.data),
  get: (id: number) => api.get<T>(`${path}/${id}`).then(r => r.data),
  create: (data: Partial<T>) => api.post<T>(path, data).then(r => r.data),
  update: (id: number, data: Partial<T>) => api.put<T>(`${path}/${id}`, data).then(r => r.data),
  remove: (id: number) => api.delete(`${path}/${id}`),
})

export const companiesApi    = crud<Company>('/companies')
export const costCentersApi  = crud<CostCenter>('/cost-centers')
export const categoriesApi   = crud<Category>('/categories')
export const clientsApi      = crud<Client>('/clients')
export const suppliersApi    = crud<Supplier>('/suppliers')
export const paymentMethodsApi = crud<PaymentMethod>('/payment-methods')
export const bankAccountsApi = crud<BankAccount>('/bank-accounts')
export const usersApi        = crud<FinanceUser>('/users')
export const auditApi        = { list: (params?: Record<string, unknown>) => api.get<PaginatedResponse<AuditLog>>('/audit', { params }).then(r => r.data) }

// Accounts Payable
export const accountsPayableApi = {
  ...crud<AccountPayable>('/accounts-payable'),
  pay: (id: number, data: { paid_at?: string; paid_amount?: number; payment_method_id?: number }) => api.patch<AccountPayable>(`/accounts-payable/${id}/pay`, data).then(r => r.data),
  cancel: (id: number) => api.patch(`/accounts-payable/${id}/cancel`),
}

// Accounts Receivable
export const accountsReceivableApi = {
  ...crud<AccountReceivable>('/accounts-receivable'),
  receive: (id: number, data: { received_at?: string; received_amount?: number; payment_method_id?: number }) => api.patch<AccountReceivable>(`/accounts-receivable/${id}/receive`, data).then(r => r.data),
  cancel: (id: number) => api.patch(`/accounts-receivable/${id}/cancel`),
}

// Cash Flow
export const cashFlowApi = {
  get: (params?: { period?: string; year?: number; month?: number }) => api.get('/cash-flow', { params }).then(r => r.data),
}

// Reimbursements
export const reimbursementsApi = {
  ...crud<Reimbursement>('/reimbursements'),
  approve: (id: number) => api.patch<Reimbursement>(`/reimbursements/${id}/approve`).then(r => r.data),
  reject: (id: number, rejection_reason: string) => api.patch<Reimbursement>(`/reimbursements/${id}/reject`, { rejection_reason }).then(r => r.data),
  pay: (id: number) => api.patch<Reimbursement>(`/reimbursements/${id}/pay`).then(r => r.data),
}

// Reports
export const reportsApi = {
  accountsPayable: (params?: Record<string, unknown>) => api.get('/reports/accounts-payable', { params }).then(r => r.data),
  accountsReceivable: (params?: Record<string, unknown>) => api.get('/reports/accounts-receivable', { params }).then(r => r.data),
  reimbursements: (params?: Record<string, unknown>) => api.get('/reports/reimbursements', { params }).then(r => r.data),
}
