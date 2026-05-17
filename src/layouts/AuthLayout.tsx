import { Box, Flex, Text } from '@chakra-ui/react'
import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) return null

  if (isAuthenticated) return <Navigate to="/" replace />

  return (
    <Flex
      minH="100vh"
      bg="page.bg"
      align="center"
      justify="center"
      p={4}
      position="relative"
      overflow="hidden"
    >
      {/* Decorative blobs */}
      <Box
        position="absolute"
        top="-120px"
        right="-80px"
        w="400px"
        h="400px"
        bg="blue.500"
        borderRadius="full"
        opacity={0.06}
        filter="blur(60px)"
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="-100px"
        left="-60px"
        w="350px"
        h="350px"
        bg="blue.700"
        borderRadius="full"
        opacity={0.05}
        filter="blur(50px)"
        pointerEvents="none"
      />

      <Box w="full" maxW="420px" position="relative" zIndex={1}>
        <Outlet />
        <Text textAlign="center" fontSize="xs" color="gray.400" mt={5}>
          © {new Date().getFullYear()} FinanceFlow. Todos os direitos reservados.
        </Text>
      </Box>
    </Flex>
  )
}
