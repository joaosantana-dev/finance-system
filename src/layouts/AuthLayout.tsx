import { Box, Flex } from '@chakra-ui/react'
import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) return null

  if (isAuthenticated) return <Navigate to="/" replace />

  return (
    <Flex minH="100vh" bg="page.bg" align="center" justify="center" p={4}>
      <Box w="full" maxW="420px">
        <Outlet />
      </Box>
    </Flex>
  )
}
