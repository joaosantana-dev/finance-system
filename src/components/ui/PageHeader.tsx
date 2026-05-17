import { Flex, Heading, Text, Box } from '@chakra-ui/react'
import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <Flex justify="space-between" align="flex-start" mb={6} gap={4} wrap="wrap">
      <Box>
        <Heading size="md" mb={description ? 1 : 0}>{title}</Heading>
        {description && <Text fontSize="sm" color="gray.500">{description}</Text>}
      </Box>
      {actions && <Flex gap={2}>{actions}</Flex>}
    </Flex>
  )
}
