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
        <Heading
          size="lg"
          fontWeight="800"
          letterSpacing="-0.03em"
          color="gray.900"
          _dark={{ color: 'white' }}
          mb={description ? 0.5 : 0}
        >
          {title}
        </Heading>
        {description && (
          <Text fontSize="sm" color="gray.500" letterSpacing="-0.01em">
            {description}
          </Text>
        )}
      </Box>
      {actions && <Flex gap={2} flexShrink={0}>{actions}</Flex>}
    </Flex>
  )
}
