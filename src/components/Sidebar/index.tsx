import { Box, Flex, Text, VStack, Separator, Avatar, IconButton, Tooltip } from '@chakra-ui/react'
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
      { label: 'Contas a Pagar',   to: '/contas-pagar',   icon: CreditCard,     roles: ['admin', 'financeiro', 'gestor'] },
      { label: 'Contas a Receber', to: '/contas-receber', icon: TrendingUp,      roles: ['admin', 'financeiro', 'gestor'] },
      { label: 'Fluxo de Caixa',   to: '/fluxo-caixa',   icon: ArrowLeftRight,  roles: ['admin', 'financeiro', 'gestor'] },
      { label: 'Conciliação',      to: '/conciliacao',    icon: Landmark,        roles: ['admin', 'financeiro'] },
    ],
  },
  {
    title: 'Cadastros',
    items: [
      { label: 'Clientes',         to: '/clientes',       icon: UserCheck,       roles: ['admin', 'financeiro', 'gestor'] },
      { label: 'Fornecedores',     to: '/fornecedores',   icon: Building2,       roles: ['admin', 'financeiro', 'gestor'] },
      { label: 'Empresas',         to: '/empresas',       icon: Landmark,        roles: ['admin'] },
      { label: 'Centros de Custo', to: '/centros-custo',  icon: Tags,            roles: ['admin', 'financeiro'] },
      { label: 'Categorias',       to: '/categorias',     icon: Tags,            roles: ['admin', 'financeiro'] },
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
      w={isCollapsed ? '68px' : '260px'}
      bg="sidebar.bg"
      borderRight="1px solid"
      borderColor="whiteAlpha.50"
      transition="width 0.22s cubic-bezier(.4,0,.2,1)"
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
        borderColor="whiteAlpha.50"
        flexShrink={0}
      >
        {!isCollapsed && (
          <Flex align="center" gap={2.5}>
            <Flex
              w={8}
              h={8}
              bgGradient="to-br"
              gradientFrom="blue.500"
              gradientTo="blue.700"
              borderRadius="lg"
              align="center"
              justify="center"
              boxShadow="0 2px 8px rgba(59,130,246,0.4)"
              flexShrink={0}
            >
              <Receipt size={16} color="white" />
            </Flex>
            <Box>
              <Text fontWeight="700" fontSize="sm" color="white" letterSpacing="tight" lineHeight="1.1">
                FinanceFlow
              </Text>
              <Text fontSize="9px" color="whiteAlpha.400" letterSpacing="widest" textTransform="uppercase" lineHeight="1.2">
                Sistema Financeiro
              </Text>
            </Box>
          </Flex>
        )}

        <IconButton
          aria-label={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
          variant="ghost"
          size="sm"
          color="whiteAlpha.400"
          onClick={onToggle}
          _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
        >
          {isCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
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
        css={{ '&::-webkit-scrollbar': { width: '3px' } }}
      >
        {NAV_GROUPS.map((group) => {
          const visibleItems = group.items.filter((item) => canAccess(item.roles))
          if (!visibleItems.length) return null

          return (
            <Box key={group.title || 'main'} mb={1}>
              {!isCollapsed && group.title && (
                <Text
                  px={4}
                  pt={3}
                  pb={1.5}
                  fontSize="9px"
                  fontWeight="700"
                  color="whiteAlpha.300"
                  letterSpacing="widest"
                  textTransform="uppercase"
                >
                  {group.title}
                </Text>
              )}
              {isCollapsed && group.title && (
                <Separator borderColor="whiteAlpha.50" my={2} mx={3} />
              )}

              {visibleItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.to)

                const navItem = (
                  <NavLink to={item.to} style={{ textDecoration: 'none' }}>
                    <Flex
                      align="center"
                      gap={3}
                      mx={2}
                      px={isCollapsed ? 0 : '10px'}
                      py="9px"
                      borderRadius="lg"
                      justify={isCollapsed ? 'center' : 'flex-start'}
                      bg={active ? 'rgba(59,130,246,0.12)' : 'transparent'}
                      color={active ? '#60a5fa' : 'whiteAlpha.500'}
                      position="relative"
                      _hover={{ bg: active ? 'rgba(59,130,246,0.15)' : 'whiteAlpha.50', color: active ? '#60a5fa' : 'white' }}
                      transition="all 0.15s ease"
                    >
                      {active && (
                        <Box
                          position="absolute"
                          left={0}
                          top="20%"
                          bottom="20%"
                          w="3px"
                          bg="blue.400"
                          borderRadius="full"
                        />
                      )}
                      <Box flexShrink={0} display="flex" alignItems="center">
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
                      <Tooltip.Content fontSize="sm">{item.label}</Tooltip.Content>
                    </Tooltip.Positioner>
                  </Tooltip.Root>
                ) : (
                  <Box key={item.to}>{navItem}</Box>
                )
              })}
            </Box>
          )
        })}
      </VStack>

      {/* User */}
      <Box
        borderTop="1px solid"
        borderColor="whiteAlpha.50"
        p={isCollapsed ? 2 : 3}
      >
        <Flex align="center" gap={2.5} justify={isCollapsed ? 'center' : 'flex-start'}>
          <Avatar.Root size="sm" flexShrink={0}>
            <Avatar.Fallback
              bg="blue.600"
              color="white"
              fontSize="xs"
              fontWeight="700"
            >
              {user?.name?.slice(0, 2).toUpperCase()}
            </Avatar.Fallback>
          </Avatar.Root>
          {!isCollapsed && (
            <Box minW={0} flex={1} overflow="hidden">
              <Text
                fontSize="sm"
                fontWeight="600"
                color="white"
                overflow="hidden"
                whiteSpace="nowrap"
                textOverflow="ellipsis"
                letterSpacing="-0.01em"
                lineHeight="1.3"
              >
                {user?.name}
              </Text>
              <Text
                fontSize="11px"
                color="whiteAlpha.400"
                overflow="hidden"
                whiteSpace="nowrap"
                textOverflow="ellipsis"
                lineHeight="1.3"
              >
                {ROLE_LABELS[user?.role ?? ''] ?? user?.role}
              </Text>
            </Box>
          )}
        </Flex>
      </Box>
    </Flex>
  )
}
