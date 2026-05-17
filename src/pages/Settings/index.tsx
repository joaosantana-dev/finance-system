import { Box, Flex, Text, Heading, Button, Field, Input, Separator } from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/hooks/useAuth'
import { useColorMode } from '@/hooks/useColorMode'
import { Moon, Sun } from 'lucide-react'

export function SettingsPage() {
  const { user } = useAuth()
  const { colorMode, toggleColorMode } = useColorMode()
  const { register, handleSubmit } = useForm({ defaultValues: { name: user?.name ?? '', email: user?.email ?? '', phone: '' } })

  return (
    <Box maxW="720px">
      <Heading size="md" mb={6}>Configurações</Heading>

      <Box bg="card.bg" borderRadius="xl" p={6} border="1px solid" borderColor="gray.100" _dark={{ borderColor: 'whiteAlpha.100' }} mb={4}>
        <Text fontWeight="600" mb={4}>Meu Perfil</Text>
        <form onSubmit={handleSubmit(() => {})}>
          <Flex direction="column" gap={4}>
            <Flex gap={4}>
              <Field.Root flex={1}><Field.Label>Nome</Field.Label><Input {...register('name')} /></Field.Root>
              <Field.Root flex={1}><Field.Label>E-mail</Field.Label><Input {...register('email')} disabled /></Field.Root>
            </Flex>
            <Field.Root><Field.Label>Telefone</Field.Label><Input {...register('phone')} /></Field.Root>
            <Separator />
            <Field.Root><Field.Label>Nova Senha</Field.Label><Input type="password" placeholder="Deixe vazio para não alterar" /></Field.Root>
            <Field.Root><Field.Label>Confirmar Nova Senha</Field.Label><Input type="password" /></Field.Root>
            <Flex justify="flex-end"><Button colorPalette="blue" type="submit">Salvar Alterações</Button></Flex>
          </Flex>
        </form>
      </Box>

      <Box bg="card.bg" borderRadius="xl" p={6} border="1px solid" borderColor="gray.100" _dark={{ borderColor: 'whiteAlpha.100' }}>
        <Text fontWeight="600" mb={4}>Aparência</Text>
        <Flex align="center" justify="space-between">
          <Box>
            <Text fontSize="sm" fontWeight="500">Tema</Text>
            <Text fontSize="xs" color="gray.500">{colorMode === 'dark' ? 'Modo escuro ativo' : 'Modo claro ativo'}</Text>
          </Box>
          <Button variant="outline" size="sm" onClick={toggleColorMode}>
            {colorMode === 'light' ? <><Moon size={16} />Ativar Modo Escuro</> : <><Sun size={16} />Ativar Modo Claro</>}
          </Button>
        </Flex>
      </Box>
    </Box>
  )
}
