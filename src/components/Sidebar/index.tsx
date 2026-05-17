import { Box, Flex, Text, IconButton, Tooltip } from '@chakra-ui/react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  CreditCard,
  TrendingUp,
  ArrowLeftRight,
  Users,
  Building2,
  Tags,
  Landmark,
  Receipt,
  FileText,
  Settings,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Wallet,
  ClipboardCheck,
  UserCheck,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import type { UserRole } from '@/types/auth'
import type { ElementType } from 'react'

interface NavItem {
  label: string
  to: string
  icon: ElementType
  roles?: UserRole[]
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: '',
    items: [
      { label: 'Dashboard', to: '/', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Financeiro',
    items: [
      { label: 'Contas a Pagar',   to: '/contas-pagar',   icon: CreditCard,    roles: ['admin', 'financeiro', 'gestor'] },
      { label: 'Contas a Receber', to: '/contas-receber', icon: TrendingUp,     roles: ['admin', 'financeiro', 'gestor'] },
      { label: 'Fluxo de Caixa',   to: '/fluxo-caixa',   icon: ArrowLeftRight, roles: ['admin', 'financeiro', 'gestor'] },
      { label: 'Conciliação',      to: '/conciliacao',    icon: Landmark,       roles: ['admin', 'financeiro'] },
    ],
  },
  {
    title: 'Cadastros',
    items: [
      { label: 'Clientes',         to: '/clientes',      icon: UserCheck, roles: ['admin', 'financeiro', 'gestor'] },
      { label: 'Fornecedores',     to: '/fornecedores',  icon: Building2, roles: ['admin', 'financeiro', 'gestor'] },
      { label: 'Empresas',         to: '/empresas',      icon: Landmark,  roles: ['admin'] },
      { label: 'Centros de Custo', to: '/centros-custo', icon: Tags,      roles: ['admin', 'financeiro'] },
      { label: 'Categorias',       to: '/categorias',    icon: Tags,      roles: ['admin', 'financeiro'] },
    ],
  },
  {
    title: 'Corporativo',
    items: [
      { label: 'Reembolsos', to: '/reembolsos', icon: Wallet,         roles: ['admin', 'financeiro', 'gestor', 'rh'] },
      { label: 'Aprovações', to: '/aprovacoes', icon: ClipboardCheck, roles: ['admin', 'financeiro', 'gestor'] },
      { label: 'Relatórios', to: '/relatorios', icon: FileText,       roles: ['admin', 'financeiro', 'gestor'] },
    ],
  },
  {
    title: 'Administração',
    items: [
      { label: 'Usuários',      to: '/usuarios',      icon: Users,       roles: ['admin'] },
      { label: 'Auditoria',     to: '/auditoria',     icon: ShieldCheck, roles: ['admin'] },
      { label: 'Configurações', to: '/configuracoes', icon: Settings,    roles: ['admin'] },
    ],
  },
]

const ROLE_LABELS: Record<string, string> = {
  admin:        'Administrador',
  financeiro:   'Financeiro',
  gestor:       'Gestor',
  rh:           'RH',
  visualizador: 'Visualizador',
}

const HEADER_H = 64
const FOOTER_H = 60

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { user } = useAuth()
  const location = useLocation()

  const canAccess = (roles?: UserRole[]) => {
    if (!roles || !user) return true
    return roles.includes(user.role)
  }

  const isActive = (to: string) => {
    if (to === '/') return location.pathname === '/'
    return location.pathname.startsWith(to)
  }

  const initials = user?.name
    ?.split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') ?? '?'

  return (
    <Box
      as="nav"
      position="fixed"
      left={0}
      top={0}
      bottom={0}
      w={isCollapsed ? '68px' : '260px'}
      zIndex={100}
      transition="width 0.22s cubic-bezier(.4,0,.2,1)"
      style={{
        background: '#111827',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* ── Header (logo + toggle) ── */}
      <Flex
        position="absolute"
        top={0}
        left={0}
        right={0}
        h={`${HEADER_H}px`}
        align="center"
        justify={isCollapsed ? 'center' : 'space-between'}
        px={isCollapsed ? 0 : 4}
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        {!isCollapsed && (
          <Flex align="center" gap={2.5}>
            <Flex
              w="32px"
              h="32px"
              borderRadius="lg"
              align="center"
              justify="center"
              flexShrink={0}
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                boxShadow: '0 2px 8px rgba(59,130,246,0.4)',
              }}
            >
              <Receipt size={15} color="white" />
            </Flex>
            <Box>
              <Text fontSize="sm" fontWeight="700" letterSpacing="-0.02em" lineHeight="1.15" style={{ color: '#fff' }}>
                FinanceFlow
              </Text>
              <Text fontSize="9px" fontWeight="600" letterSpacing="0.12em" textTransform="uppercase" lineHeight="1.2" style={{ color: 'rgba(255,255,255,0.28)' }}>
                Sistema Financeiro
              </Text>
            </Box>
          </Flex>
        )}

        <IconButton
          aria-label={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
          variant="ghost"
          size="sm"
          onClick={onToggle}
          style={{ color: 'rgba(255,255,255,0.35)' }}
          _hover={{ bg: 'rgba(255,255,255,0.06)' } as object}
        >
          {isCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </IconButton>
      </Flex>

      {/* ── Scrollable nav area ── */}
      <Box
        position="absolute"
        top={`${HEADER_H}px`}
        bottom={`${FOOTER_H}px`}
        left={0}
        right={0}
        overflowY="auto"
        overflowX="hidden"
        py={2}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.12) transparent',
        }}
        css={{
          '&::-webkit-scrollbar': { width: '4px' },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.12)', borderRadius: '10px' },
        }}
      >
        {NAV_GROUPS.map((group) => {
          const visibleItems = group.items.filter((item) => canAccess(item.roles))
          if (!visibleItems.length) return null

          return (
            <Box key={group.title || 'main'} mb={1}>
              {!isCollapsed && group.title && (
                <Text
                  px={4}
                  pt={4}
                  pb={1}
                  fontSize="10px"
                  fontWeight="700"
                  letterSpacing="0.1em"
                  textTransform="uppercase"
                  style={{ color: 'rgba(255,255,255,0.28)' }}
                >
                  {group.title}
                </Text>
              )}
              {isCollapsed && group.title && (
                <Box my={2} mx={3} h="1px" style={{ background: 'rgba(255,255,255,0.06)' }} />
              )}

              {visibleItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.to)

                const navItem = (
                  <NavLink to={item.to} style={{ textDecoration: 'none', display: 'block' }}>
                    <Flex
                      align="center"
                      gap={3}
                      mx={2}
                      px={isCollapsed ? 0 : '10px'}
                      py="9px"
                      borderRadius="10px"
                      justify={isCollapsed ? 'center' : 'flex-start'}
                      position="relative"
                      transition="background 0.15s, color 0.15s"
                      style={{
                        background: active ? 'rgba(59,130,246,0.14)' : 'transparent',
                        color: active ? '#93c5fd' : 'rgba(255,255,255,0.55)',
                      }}
                      _hover={{
                        background: active ? 'rgba(59,130,246,0.18)' : 'rgba(255,255,255,0.06)',
                        color: active ? '#93c5fd' : '#ffffff',
                      } as object}
                    >
                      {active && (
                        <Box
                          position="absolute"
                          left="1px"
                          top="18%"
                          bottom="18%"
                          w="3px"
                          borderRadius="full"
                          style={{ background: '#3b82f6' }}
                        />
                      )}
                      <Box flexShrink={0} style={{ display: 'flex', alignItems: 'center' }}>
                        <Icon size={17} />
                      </Box>
                      {!isCollapsed && (
                        <Text
                          fontSize="sm"
                          fontWeight={active ? '600' : '400'}
                          overflow="hidden"
                          whiteSpace="nowrap"
                          textOverflow="ellipsis"
                          letterSpacing="-0.01em"
                          color="inherit"
                        >
                          {item.label}
                        </Text>
                      )}
                    </Flex>
                  </NavLink>
                )

                return isCollapsed ? (
                  <Tooltip.Root key={item.to} positioning={{ placement: 'right' }}>
                    <Tooltip.Trigger asChild>
                      <Box>{navItem}</Box>
                    </Tooltip.Trigger>
                    <Tooltip.Positioner>
                      <Tooltip.Content fontSize="xs">{item.label}</Tooltip.Content>
                    </Tooltip.Positioner>
                  </Tooltip.Root>
                ) : (
                  <Box key={item.to}>{navItem}</Box>
                )
              })}
            </Box>
          )
        })}
      </Box>

      {/* ── Footer (user info) ── */}
      <Flex
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        h={`${FOOTER_H}px`}
        align="center"
        px={isCollapsed ? 2 : 3}
        justify={isCollapsed ? 'center' : 'flex-start'}
        gap={2.5}
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <Flex
          w="32px"
          h="32px"
          borderRadius="lg"
          align="center"
          justify="center"
          flexShrink={0}
          style={{
            background: '#1e293b',
            color: '#94a3b8',
            fontSize: '11px',
            fontWeight: '700',
            letterSpacing: '0.02em',
            userSelect: 'none',
          }}
        >
          {initials}
        </Flex>

        {!isCollapsed && (
          <Box minW={0} flex={1} overflow="hidden">
            <Text
              fontSize="sm"
              fontWeight="600"
              overflow="hidden"
              whiteSpace="nowrap"
              textOverflow="ellipsis"
              letterSpacing="-0.01em"
              lineHeight="1.35"
              style={{ color: '#ffffff' }}
            >
              {user?.name}
            </Text>
            <Text
              fontSize="11px"
              overflow="hidden"
              whiteSpace="nowrap"
              textOverflow="ellipsis"
              lineHeight="1.35"
              style={{ color: 'rgba(255,255,255,0.38)' }}
            >
              {ROLE_LABELS[user?.role ?? ''] ?? user?.role}
            </Text>
          </Box>
        )}
      </Flex>
    </Box>
  )
}
