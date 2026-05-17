import { Box, Flex, Text, VStack, Separator, Avatar, IconButton } from '@chakra-ui/react'
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
      { label: 'Contas a Pagar',   to: '/contas-pagar',   icon: CreditCard,  roles: ['admin', 'financeiro', 'gestor'] },
      { label: 'Contas a Receber', to: '/contas-receber', icon: TrendingUp,   roles: ['admin', 'financeiro', 'gestor'] },
      { label: 'Fluxo de Caixa',   to: '/fluxo-caixa',   icon: ArrowLeftRight, roles: ['admin', 'financeiro', 'gestor'] },
      { label: 'Conciliação',      to: '/conciliacao',    icon: Landmark,    roles: ['admin', 'financeiro'] },
    ],
  },
  {
    title: 'Cadastros',
    items: [
      { label: 'Clientes',         to: '/clientes',       icon: UserCheck,   roles: ['admin', 'financeiro', 'gestor'] },
      { label: 'Fornecedores',     to: '/fornecedores',   icon: Building2,   roles: ['admin', 'financeiro', 'gestor'] },
      { label: 'Empresas',         to: '/empresas',       icon: Landmark,    roles: ['admin'] },
      { label: 'Centros de Custo', to: '/centros-custo',  icon: Tags,        roles: ['admin', 'financeiro'] },
      { label: 'Categorias',       to: '/categorias',     icon: Tags,        roles: ['admin', 'financeiro'] },
    ],
  },
  {
    title: 'Corporativo',
    items: [
      { label: 'Reembolsos',  to: '/reembolsos',  icon: Wallet,         roles: ['admin', 'financeiro', 'gestor', 'rh'] },
      { label: 'Aprovações',  to: '/aprovacoes',  icon: ClipboardCheck, roles: ['admin', 'financeiro', 'gestor'] },
      { label: 'Relatórios',  to: '/relatorios',  icon: FileText,       roles: ['admin', 'financeiro', 'gestor'] },
    ],
  },
  {
    title: 'Administração',
    items: [
      { label: 'Usuários',       to: '/usuarios',       icon: Users,       roles: ['admin'] },
      { label: 'Auditoria',      to: '/auditoria',      icon: ShieldCheck, roles: ['admin'] },
      { label: 'Configurações',  to: '/configuracoes',  icon: Settings,    roles: ['admin'] },
    ],
  },
]

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

  return (
    <Flex
      as="nav"
      direction="column"
      position="fixed"
      left={0}
      top={0}
      bottom={0}
      w={isCollapsed ? '64px' : '260px'}
      bg="sidebar.bg"
      borderRight="1px solid"
      borderColor="whiteAlpha.100"
      transition="width 0.2s ease"
      zIndex={100}
      overflow="hidden"
    >
      {/* Logo */}
      <Flex
        align="center"
        justify={isCollapsed ? 'center' : 'space-between'}
        px={isCollapsed ? 0 : 4}
        h="64px"
        borderBottom="1px solid"
        borderColor="whiteAlpha.100"
        flexShrink={0}
      >
        {!isCollapsed && (
          <Flex align="center" gap={2}>
            <Flex
              w={8}
              h={8}
              bg="brand.600"
              borderRadius="md"
              align="center"
              justify="center"
            >
              <Receipt size={18} color="white" />
            </Flex>
            <Text fontWeight="700" fontSize="md" color="white" letterSpacing="tight">
              FinanceFlow
            </Text>
          </Flex>
        )}

        <IconButton
          aria-label="Toggle sidebar"
          variant="ghost"
          size="sm"
          color="whiteAlpha.600"
          onClick={onToggle}
          _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </IconButton>
      </Flex>

      {/* Nav */}
      <VStack
        flex={1}
        overflowY="auto"
        overflowX="hidden"
        py={3}
        gap={0}
        align="stretch"
      >
        {NAV_GROUPS.map((group) => {
          const visibleItems = group.items.filter((item) => canAccess(item.roles))
          if (!visibleItems.length) return null

          return (
            <Box key={group.title || 'main'} mb={1}>
              {!isCollapsed && group.title && (
                <Text
                  px={4}
                  py={2}
                  fontSize="10px"
                  fontWeight="600"
                  color="whiteAlpha.400"
                  letterSpacing="wider"
                  textTransform="uppercase"
                >
                  {group.title}
                </Text>
              )}
              {isCollapsed && group.title && (
                <Separator borderColor="whiteAlpha.100" my={2} />
              )}

              {visibleItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.to)

                return (
                  <Box key={item.to} px={2}>
                    <NavLink to={item.to} title={isCollapsed ? item.label : undefined} style={{ textDecoration: 'none' }}>
                      <Flex
                        align="center"
                        gap={3}
                        px={isCollapsed ? 0 : 3}
                        py="10px"
                        borderRadius="md"
                        justify={isCollapsed ? 'center' : 'flex-start'}
                        bg={active ? 'whiteAlpha.100' : 'transparent'}
                        color={active ? 'white' : 'whiteAlpha.600'}
                        borderLeft={active ? '3px solid' : '3px solid transparent'}
                        borderLeftColor={active ? 'brand.400' : 'transparent'}
                        _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
                        transition="all 0.15s"
                      >
                        <Box flexShrink={0} display="flex" alignItems="center">
                          <Icon size={18} />
                        </Box>
                        {!isCollapsed && (
                          <Text
                            fontSize="sm"
                            fontWeight={active ? '600' : '400'}
                            overflow="hidden"
                            whiteSpace="nowrap"
                            textOverflow="ellipsis"
                          >
                            {item.label}
                          </Text>
                        )}
                      </Flex>
                    </NavLink>
                  </Box>
                )
              })}
            </Box>
          )
        })}
      </VStack>

      {/* User */}
      <Box
        borderTop="1px solid"
        borderColor="whiteAlpha.100"
        p={isCollapsed ? 2 : 4}
      >
        <Flex align="center" gap={3} justify={isCollapsed ? 'center' : 'flex-start'}>
          <Avatar.Root size="sm" flexShrink={0}>
            <Avatar.Fallback bg="brand.600" color="white" fontSize="xs">
              {user?.name?.slice(0, 2).toUpperCase()}
            </Avatar.Fallback>
          </Avatar.Root>
          {!isCollapsed && (
            <Box minW={0} overflow="hidden">
              <Text
                fontSize="sm"
                fontWeight="600"
                color="white"
                overflow="hidden"
                whiteSpace="nowrap"
                textOverflow="ellipsis"
              >
                {user?.name}
              </Text>
              <Text
                fontSize="xs"
                color="whiteAlpha.500"
                overflow="hidden"
                whiteSpace="nowrap"
                textOverflow="ellipsis"
              >
                {user?.role}
              </Text>
            </Box>
          )}
        </Flex>
      </Box>
    </Flex>
  )
}
