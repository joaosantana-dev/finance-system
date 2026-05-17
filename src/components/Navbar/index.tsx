import {
  Flex,
  Text,
  IconButton,
  Box,
  Menu,
  Avatar,
} from '@chakra-ui/react'
import { Bell, LogOut, Moon, Sun, User, ChevronDown } from 'lucide-react'
import { useColorMode } from '@/hooks/useColorMode'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'

const ROLE_LABELS: Record<string, string> = {
  admin:        'Administrador',
  financeiro:   'Financeiro',
  gestor:       'Gestor',
  rh:           'RH',
  visualizador: 'Visualizador',
}

interface NavbarProps {
  sidebarCollapsed: boolean
  title?: string
}

export function Navbar({ sidebarCollapsed, title }: NavbarProps) {
  const { colorMode, toggleColorMode } = useColorMode()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Flex
      as="header"
      position="fixed"
      top={0}
      left={sidebarCollapsed ? '68px' : '260px'}
      right={0}
      h="64px"
      bg="navbar.bg"
      backdropFilter="blur(12px)"
      borderBottom="1px solid"
      borderColor="gray.200"
      _dark={{ borderColor: 'whiteAlpha.60' }}
      align="center"
      justify="space-between"
      px={6}
      zIndex={90}
      transition="left 0.22s cubic-bezier(.4,0,.2,1)"
    >
      <Text
        fontSize="lg"
        fontWeight="700"
        color="gray.900"
        _dark={{ color: 'white' }}
        letterSpacing="-0.02em"
      >
        {title}
      </Text>

      <Flex align="center" gap={1}>
        <IconButton
          aria-label="Alternar modo de cor"
          variant="ghost"
          size="sm"
          onClick={toggleColorMode}
          color="gray.500"
          _dark={{ color: 'gray.400' }}
          _hover={{ bg: 'gray.100', color: 'gray.700', _dark: { bg: 'whiteAlpha.100', color: 'white' } }}
          borderRadius="lg"
        >
          {colorMode === 'light' ? <Moon size={17} /> : <Sun size={17} />}
        </IconButton>

        <Box position="relative">
          <IconButton
            aria-label="Notificações"
            variant="ghost"
            size="sm"
            color="gray.500"
            _dark={{ color: 'gray.400' }}
            _hover={{ bg: 'gray.100', color: 'gray.700', _dark: { bg: 'whiteAlpha.100', color: 'white' } }}
            borderRadius="lg"
          >
            <Bell size={17} />
          </IconButton>
          <Box
            position="absolute"
            top="10px"
            right="10px"
            w="7px"
            h="7px"
            bg="red.500"
            borderRadius="full"
            border="1.5px solid"
            borderColor="white"
            _dark={{ borderColor: 'gray.900' }}
          />
        </Box>

        <Box w="1px" h={5} bg="gray.200" _dark={{ bg: 'whiteAlpha.100' }} mx={1} />

        <Menu.Root>
          <Menu.Trigger asChild>
            <Flex
              align="center"
              gap={2}
              px={2.5}
              py={1.5}
              borderRadius="xl"
              cursor="pointer"
              _hover={{ bg: 'gray.100', _dark: { bg: 'whiteAlpha.80' } }}
              transition="background 0.15s"
            >
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
              <Box display={{ base: 'none', md: 'block' }}>
                <Text fontSize="sm" fontWeight="600" lineHeight="1.2" color="gray.800" _dark={{ color: 'gray.100' }} letterSpacing="-0.01em">
                  {user?.name}
                </Text>
                <Text fontSize="11px" color="gray.500" lineHeight="1.2">
                  {ROLE_LABELS[user?.role ?? ''] ?? user?.role}
                </Text>
              </Box>
              <ChevronDown size={14} color="#9ca3af" />
            </Flex>
          </Menu.Trigger>

          <Menu.Positioner>
            <Menu.Content minW="200px" borderRadius="xl" boxShadow="lg">
              <Box px={3} py={2.5} borderBottom="1px solid" borderColor="gray.100" _dark={{ borderColor: 'whiteAlpha.100' }}>
                <Text fontSize="xs" fontWeight="600" color="gray.800" _dark={{ color: 'gray.100' }}>
                  {user?.name}
                </Text>
                <Text fontSize="11px" color="gray.500">
                  {user?.company_name}
                </Text>
              </Box>
              <Menu.Item value="profile" onClick={() => navigate('/configuracoes')} borderRadius="lg" mt={1}>
                <User size={15} />
                Meu perfil
              </Menu.Item>
              <Menu.Separator />
              <Menu.Item value="logout" color="red.500" onClick={handleLogout} borderRadius="lg" mb={1}>
                <LogOut size={15} />
                Sair da conta
              </Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Menu.Root>
      </Flex>
    </Flex>
  )
}
