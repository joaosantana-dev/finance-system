import { useState } from 'react'
import { Box } from '@chakra-ui/react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '@/components/Sidebar'
import { Navbar } from '@/components/Navbar'

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/contas-pagar': 'Contas a Pagar',
  '/contas-receber': 'Contas a Receber',
  '/fluxo-caixa': 'Fluxo de Caixa',
  '/conciliacao': 'Conciliação Bancária',
  '/clientes': 'Clientes',
  '/fornecedores': 'Fornecedores',
  '/empresas': 'Empresas',
  '/centros-custo': 'Centros de Custo',
  '/categorias': 'Categorias',
  '/reembolsos': 'Reembolsos',
  '/aprovacoes': 'Aprovações',
  '/relatorios': 'Relatórios',
  '/usuarios': 'Usuários',
  '/auditoria': 'Auditoria',
  '/configuracoes': 'Configurações',
}

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const location = useLocation()

  const title = PAGE_TITLES[location.pathname] ?? 'FinanceFlow'

  return (
    <Box minH="100vh" bg="page.bg">
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
      />

      <Box
        ml={sidebarCollapsed ? '68px' : '260px'}
        transition="margin-left 0.22s cubic-bezier(.4,0,.2,1)"
        minH="100vh"
        display="flex"
        flexDirection="column"
      >
        <Navbar sidebarCollapsed={sidebarCollapsed} title={title} />

        <Box as="main" flex={1} pt="64px" p={6}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
