import { useState } from 'react'
import {
  Box,
  Button,
  Field,
  Flex,
  Heading,
  Input,
  Text,
  Alert,
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Receipt } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
})

type FormData = z.infer<typeof schema>

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    try {
      setError('')
      await login(data)
      navigate('/')
    } catch {
      setError('E-mail ou senha incorretos.')
    }
  }

  return (
    <Box bg="card.bg" borderRadius="xl" boxShadow="lg" p={8}>
      {/* Logo */}
      <Flex align="center" justify="center" gap={3} mb={8}>
        <Flex
          w={10}
          h={10}
          bg="brand.600"
          borderRadius="lg"
          align="center"
          justify="center"
        >
          <Receipt size={22} color="white" />
        </Flex>
        <Box>
          <Heading size="md" lineHeight="1">
            FinanceFlow
          </Heading>
          <Text fontSize="xs" color="gray.500">
            Sistema Financeiro Corporativo
          </Text>
        </Box>
      </Flex>

      <Heading size="sm" mb={1}>
        Bem-vindo de volta
      </Heading>
      <Text fontSize="sm" color="gray.500" mb={6}>
        Entre com suas credenciais para acessar o sistema.
      </Text>

      {error && (
        <Alert.Root status="error" borderRadius="md" mb={4}>
          <Alert.Indicator />
          <Alert.Description>{error}</Alert.Description>
        </Alert.Root>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Flex direction="column" gap={4}>
          <Field.Root invalid={!!errors.email}>
            <Field.Label fontSize="sm">E-mail</Field.Label>
            <Input
              type="email"
              placeholder="seu@email.com"
              {...register('email')}
            />
            {errors.email && (
              <Field.ErrorText>{errors.email.message}</Field.ErrorText>
            )}
          </Field.Root>

          <Field.Root invalid={!!errors.password}>
            <Field.Label fontSize="sm">Senha</Field.Label>
            <Input
              type="password"
              placeholder="••••••••"
              {...register('password')}
            />
            {errors.password && (
              <Field.ErrorText>{errors.password.message}</Field.ErrorText>
            )}
          </Field.Root>

          <Button
            type="submit"
            colorPalette="blue"
            loading={isSubmitting}
            loadingText="Entrando..."
            mt={2}
            w="full"
          >
            Entrar
          </Button>
        </Flex>
      </form>
    </Box>
  )
}
