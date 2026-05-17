import {
  Flex,
  Text,
  IconButton,
  Box,
  Menu,
  Avatar,
  Badge,
} from '@chakra-ui/react'
import { Bell, LogOut, Moon, Sun, User } from 'lucide-react'
import { useColorMode } from '@/hooks/useColorMode'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'

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
      left={sidebarCollapsed ? '64px' : '260px'}
      right={0}
      h="64px"
      bg="navbar.bg"
      borderBottom="1px solid"
      borderColor="gray.200"
      _dark={{ borderColor: 'whiteAlpha.100' }}
      align="center"
      justify="space-between"
      px={6}
      zIndex={90}
      transition="left 0.2s ease"
    >
      <Text fontSize="lg" fontWeight="600" color="gray.800" _dark={{ color: 'white' }}>
        {title}
      </Text>

      <Flex align="center" gap={2}>
        <IconButton
          aria-label="Toggle color mode"
          variant="ghost"
          size="sm"
          onClick={toggleColorMode}
          color="gray.500"
          _hover={{ bg: 'gray.100', _dark: { bg: 'whiteAlpha.100' } }}
        >
          {colorMode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </IconButton>

        <Box position="relative">
          <IconButton
            aria-label="Notifications"
            variant="ghost"
            size="sm"
            color="gray.500"
            _hover={{ bg: 'gray.100', _dark: { bg: 'whiteAlpha.100' } }}
          >
            <Bell size={18} />
          </IconButton>
          <Badge
            position="absolute"
            top="6px"
            right="6px"
            bg="red.500"
            color="white"
            borderRadius="full"
            minW="8px"
            h="8px"
            p={0}
          />
        </Box>

        <Menu.Root>
          <Menu.Trigger asChild>
            <Flex
              align="center"
              gap={2}
              px={2}
              py={1}
              borderRadius="md"
              cursor="pointer"
              _hover={{ bg: 'gray.100', _dark: { bg: 'whiteAlpha.100' } }}
            >
              <Avatar.Root size="sm">
                <Avatar.Fallback bg="brand.600" color="white" fontSize="xs">
                  {user?.name?.slice(0, 2).toUpperCase()}
                </Avatar.Fallback>
              </Avatar.Root>
              <Box display={{ base: 'none', md: 'block' }}>
                <Text fontSize="sm" fontWeight="500" lineHeight="1.2" color="gray.700" _dark={{ color: 'gray.200' }}>
                  {user?.name}
                </Text>
                <Text fontSize="xs" color="gray.500" lineHeight="1.2">
                  {user?.company_name}
                </Text>
              </Box>
            </Flex>
          </Menu.Trigger>

          <Menu.Positioner>
            <Menu.Content minW="180px">
              <Menu.Item value="profile" onClick={() => navigate('/configuracoes')}>
                <User size={16} />
                Meu perfil
              </Menu.Item>
              <Menu.Separator />
              <Menu.Item value="logout" color="red.500" onClick={handleLogout}>
                <LogOut size={16} />
                Sair
              </Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Menu.Root>
      </Flex>
    </Flex>
  )
}
