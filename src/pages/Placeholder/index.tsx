import { Box, Flex, Text, Heading } from '@chakra-ui/react'
import { Construction } from 'lucide-react'

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <Box>
      <Heading size="md" mb={6}>{title}</Heading>
      <Flex
        bg="card.bg"
        borderRadius="xl"
        border="2px dashed"
        borderColor="gray.200"
        _dark={{ borderColor: 'whiteAlpha.200' }}
        align="center"
        justify="center"
        direction="column"
        gap={3}
        minH="400px"
        color="gray.400"
      >
        <Construction size={40} />
        <Text fontWeight="500">Em desenvolvimento</Text>
        <Text fontSize="sm">Este módulo será implementado nas próximas fases.</Text>
      </Flex>
    </Box>
  )
}
