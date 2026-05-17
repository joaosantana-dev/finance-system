import { useState } from 'react'
import {
  Box,
  Button,
  Field,
  Flex,
  Input,
  Text,
  Alert,
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { TrendingUp, Lock, Mail, ArrowRight } from 'lucide-react'
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
    <Box
      bg="white"
      borderRadius="3xl"
      boxShadow="0 0 0 1px rgba(0,0,0,0.06), 0 24px 48px -12px rgba(0,0,0,0.14)"
      _dark={{ bg: '#161b22', boxShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 24px 48px -12px rgba(0,0,0,0.6)' }}
      overflow="hidden"
      position="relative"
    >
      {/* Dot grid decoration */}
      <Box
        position="absolute"
        top={0}
        right={0}
        w="200px"
        h="200px"
        opacity={0.035}
        _dark={{ opacity: 0.06 }}
        pointerEvents="none"
        style={{
          backgroundImage: 'radial-gradient(circle, #2563eb 1px, transparent 1px)',
          backgroundSize: '18px 18px',
        }}
      />

      <Box px={9} pt={10} pb={9}>
        {/* Brand */}
        <Flex direction="column" align="center" mb={8}>
          <Box position="relative" mb={4}>
            <Box
              position="absolute"
              inset="-8px"
              borderRadius="full"
              bg="blue.500"
              opacity={0.1}
              filter="blur(12px)"
            />
            <Flex
              w="52px"
              h="52px"
              borderRadius="2xl"
              bg="blue.600"
              align="center"
              justify="center"
              boxShadow="0 8px 24px rgba(37,99,235,0.35)"
              position="relative"
            >
              <TrendingUp size={24} color="white" strokeWidth={2.2} />
            </Flex>
          </Box>

          <Text
            fontSize="xl"
            fontWeight="800"
            letterSpacing="-0.04em"
            color="gray.900"
            _dark={{ color: 'white' }}
            lineHeight="1"
            mb={1}
          >
            FinanceFlow
          </Text>
          <Text fontSize="xs" color="gray.400" letterSpacing="wider" textTransform="uppercase" fontWeight="500">
            Sistema Financeiro Corporativo
          </Text>
        </Flex>

        {/* Heading */}
        <Box mb={6}>
          <Text
            fontSize="xl"
            fontWeight="700"
            letterSpacing="-0.03em"
            color="gray.900"
            _dark={{ color: 'white' }}
            mb={1}
          >
            Bem-vindo de volta
          </Text>
          <Text fontSize="sm" color="gray.500">
            Entre com suas credenciais para continuar.
          </Text>
        </Box>

        {error && (
          <Alert.Root status="error" borderRadius="xl" mb={5} fontSize="sm" py={3}>
            <Alert.Indicator />
            <Alert.Description>{error}</Alert.Description>
          </Alert.Root>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Flex direction="column" gap={4}>
            {/* Email */}
            <Field.Root invalid={!!errors.email}>
              <Field.Label
                fontSize="xs"
                fontWeight="600"
                color="gray.600"
                _dark={{ color: 'gray.400' }}
                textTransform="uppercase"
                letterSpacing="wider"
                mb={1.5}
              >
                E-mail
              </Field.Label>
              <Box position="relative" w="full">
                <Box
                  position="absolute"
                  left="16px"
                  top="50%"
                  transform="translateY(-50%)"
                  color="gray.400"
                  pointerEvents="none"
                  zIndex={1}
                >
                  <Mail size={15} />
                </Box>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  pl="46px"
                  h="52px"
                  borderRadius="xl"
                  borderColor="gray.200"
                  bg="gray.50"
                  _dark={{ borderColor: 'whiteAlpha.80', bg: 'whiteAlpha.30' }}
                  _hover={{ borderColor: 'blue.300', bg: 'white', _dark: { bg: 'whiteAlpha.50' } }}
                  _focus={{ borderColor: 'blue.500', bg: 'white', boxShadow: '0 0 0 3px rgba(59,130,246,0.12)', _dark: { bg: 'transparent' } }}
                  fontSize="md"
                  transition="all 0.15s"
                  {...register('email')}
                />
              </Box>
              {errors.email && <Field.ErrorText fontSize="xs" mt={1}>{errors.email.message}</Field.ErrorText>}
            </Field.Root>

            {/* Password */}
            <Field.Root invalid={!!errors.password}>
              <Flex justify="space-between" align="center" mb={1.5}>
                <Field.Label
                  fontSize="xs"
                  fontWeight="600"
                  color="gray.600"
                  _dark={{ color: 'gray.400' }}
                  textTransform="uppercase"
                  letterSpacing="wider"
                  mb={0}
                >
                  Senha
                </Field.Label>
              </Flex>
              <Box position="relative" w="full">
                <Box
                  position="absolute"
                  left="16px"
                  top="50%"
                  transform="translateY(-50%)"
                  color="gray.400"
                  pointerEvents="none"
                  zIndex={1}
                >
                  <Lock size={15} />
                </Box>
                <Input
                  type="password"
                  placeholder="••••••••"
                  pl="46px"
                  h="52px"
                  borderRadius="xl"
                  borderColor="gray.200"
                  bg="gray.50"
                  _dark={{ borderColor: 'whiteAlpha.80', bg: 'whiteAlpha.30' }}
                  _hover={{ borderColor: 'blue.300', bg: 'white', _dark: { bg: 'whiteAlpha.50' } }}
                  _focus={{ borderColor: 'blue.500', bg: 'white', boxShadow: '0 0 0 3px rgba(59,130,246,0.12)', _dark: { bg: 'transparent' } }}
                  fontSize="md"
                  transition="all 0.15s"
                  {...register('password')}
                />
              </Box>
              {errors.password && <Field.ErrorText fontSize="xs" mt={1}>{errors.password.message}</Field.ErrorText>}
            </Field.Root>

            {/* Submit */}
            <Button
              type="submit"
              colorPalette="blue"
              loading={isSubmitting}
              loadingText="Entrando..."
              mt={2}
              w="full"
              h="46px"
              borderRadius="xl"
              fontWeight="700"
              fontSize="sm"
              letterSpacing="-0.01em"
              boxShadow="0 4px 16px rgba(37,99,235,0.3)"
              _hover={{
                boxShadow: '0 6px 22px rgba(37,99,235,0.45)',
                transform: 'translateY(-1px)',
              }}
              _active={{ transform: 'translateY(0)', boxShadow: '0 2px 8px rgba(37,99,235,0.3)' }}
              transition="all 0.18s ease"
            >
              <Flex align="center" gap={2}>
                Acessar o sistema
                <ArrowRight size={16} strokeWidth={2.5} />
              </Flex>
            </Button>
          </Flex>
        </form>

        {/* Footer divider */}
        <Box mt={7} pt={6} borderTop="1px solid" borderColor="gray.100" _dark={{ borderColor: 'whiteAlpha.80' }}>
          <Text fontSize="11px" color="gray.400" textAlign="center" letterSpacing="0.01em">
            Acesso restrito a usuários autorizados
          </Text>
        </Box>
      </Box>
    </Box>
  )
}
