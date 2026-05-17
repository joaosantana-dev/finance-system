export interface Company {
  id: number; name: string; cnpj?: string; email?: string; phone?: string; address?: string; status: 'ativo' | 'inativo'
}

export interface CostCenter {
  id: number; company_id: number; name: string; code?: string; description?: string; status: 'ativo' | 'inativo'
}

export interface Category {
  id: number; company_id: number; name: string; type: 'receita' | 'despesa' | 'ambos'; color: string; status: 'ativo' | 'inativo'
}

export interface Client {
  id: number; company_id: number; name: string; type: 'pf' | 'pj'; document?: string; email?: string; phone?: string; address?: string; status: 'ativo' | 'inativo'
}

export interface Supplier {
  id: number; company_id: number; name: string; type: 'pf' | 'pj'; document?: string; email?: string; phone?: string; address?: string; status: 'ativo' | 'inativo'
}

export interface PaymentMethod {
  id: number; company_id: number; name: string; type: string; status: 'ativo' | 'inativo'
}

export interface BankAccount {
  id: number; company_id: number; name: string; bank?: string; agency?: string; account?: string; initial_balance: number; current_balance: number; status: 'ativo' | 'inativo'
}

export type PayableStatus = 'pendente' | 'pago' | 'vencido' | 'cancelado'
export type ReceivableStatus = 'pendente' | 'recebido' | 'vencido' | 'cancelado' | 'negociado'
export type ReimbursementStatus = 'pendente' | 'aprovado' | 'rejeitado' | 'pago'
export type ReimbursementType = 'alimentacao' | 'transporte' | 'hospedagem' | 'combustivel' | 'outros'

export interface AccountPayable {
  id: number; company_id: number; description: string; amount: number; paid_amount?: number; due_date: string; competence_date?: string; paid_at?: string; status: PayableStatus; recurrence: string; observations?: string
  supplier_id?: number; supplier_name?: string; category_id?: number; category_name?: string; category_color?: string; cost_center_id?: number; cost_center_name?: string; payment_method_id?: number; payment_method_name?: string; installment_number?: number; total_installments?: number
}

export interface AccountReceivable {
  id: number; company_id: number; description: string; amount: number; received_amount?: number; due_date: string; received_at?: string; status: ReceivableStatus; recurrence: string; observations?: string
  client_id?: number; client_name?: string; category_id?: number; category_name?: string; category_color?: string; payment_method_id?: number; payment_method_name?: string
}

export interface Reimbursement {
  id: number; company_id: number; requester_id: number; requester_name?: string; approver_name?: string; type: ReimbursementType; description: string; amount: number; receipt_date: string; observations?: string; status: ReimbursementStatus; rejection_reason?: string; approved_at?: string; paid_at?: string
}

export interface DashboardSummary {
  currentBalance: number; totalRevenue: number; totalExpenses: number; overduePayable: number; dueSoonPayable: number; overdueReceivable: number; netFlow: number
}

export interface MonthlyFlow {
  month: string; receitas: number; despesas: number
}

export interface CategoryExpense {
  name: string; color: string; total: number
}

export interface FinanceUser {
  id: number; name: string; email: string; role: string; status: 'ativo' | 'inativo'; phone?: string; last_login_at?: string; company_name?: string
}

export interface AuditLog {
  id: number; user_id?: number; user_name?: string; action: string; entity?: string; entity_id?: number; before?: unknown; after?: unknown; ip_address?: string; created_at: string
}
