import { Navigate, Outlet } from 'react-router-dom'
import { Spinner, Center } from '@chakra-ui/react'
import { useAuth } from '@/hooks/useAuth'
import type { UserRole } from '@/types/auth'

interface PrivateRouteProps {
  roles?: UserRole[]
}

export function PrivateRoute({ roles }: PrivateRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return (
      <Center minH="100vh">
        <Spinner size="xl" color="brand.500" />
      </Center>
    )
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
