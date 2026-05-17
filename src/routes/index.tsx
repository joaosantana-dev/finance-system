import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthLayout } from '@/layouts/AuthLayout'
import { AppLayout } from '@/layouts/AppLayout'
import { PrivateRoute } from './PrivateRoute'
import { LoginPage } from '@/pages/Login'
import { DashboardPage } from '@/pages/Dashboard'
import { SuppliersPage } from '@/pages/Suppliers'
import { ClientsPage } from '@/pages/Clients'
import { CostCentersPage } from '@/pages/CostCenters'
import { CategoriesPage } from '@/pages/Categories'
import { AccountsPayablePage } from '@/pages/AccountsPayable'
import { AccountsReceivablePage } from '@/pages/AccountsReceivable'
import { CashFlowPage } from '@/pages/CashFlow'
import { ReimbursementsPage } from '@/pages/Reimbursements'
import { ApprovalsPage } from '@/pages/Approvals'
import { ReportsPage } from '@/pages/Reports'
import { UsersPage } from '@/pages/Users'
import { AuditPage } from '@/pages/Audit'
import { SettingsPage } from '@/pages/Settings'
import { PlaceholderPage } from '@/pages/Placeholder'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<PrivateRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />

          {/* Financeiro */}
          <Route path="/contas-pagar" element={<AccountsPayablePage />} />
          <Route path="/contas-receber" element={<AccountsReceivablePage />} />
          <Route path="/fluxo-caixa" element={<CashFlowPage />} />
          <Route path="/conciliacao" element={<PlaceholderPage title="Conciliação Bancária" />} />

          {/* Cadastros */}
          <Route path="/clientes" element={<ClientsPage />} />
          <Route path="/fornecedores" element={<SuppliersPage />} />
          <Route path="/empresas" element={<PlaceholderPage title="Empresas" />} />
          <Route path="/centros-custo" element={<CostCentersPage />} />
          <Route path="/categorias" element={<CategoriesPage />} />

          {/* Corporativo */}
          <Route path="/reembolsos" element={<ReimbursementsPage />} />
          <Route path="/aprovacoes" element={<ApprovalsPage />} />
          <Route path="/relatorios" element={<ReportsPage />} />

          {/* Admin */}
          <Route path="/usuarios" element={<PrivateRoute roles={['admin']} />}>
            <Route index element={<UsersPage />} />
          </Route>
          <Route path="/auditoria" element={<PrivateRoute roles={['admin']} />}>
            <Route index element={<AuditPage />} />
          </Route>
          <Route path="/configuracoes" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
