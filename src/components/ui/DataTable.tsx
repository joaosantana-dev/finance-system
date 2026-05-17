import { Box, Table, Text, Flex, Button, Skeleton, Center, Input } from '@chakra-ui/react'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import type { ReactNode } from 'react'

export interface Column<T> {
  key: string
  label: string
  render?: (row: T) => ReactNode
  width?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  isLoading?: boolean
  pagination?: { page: number; totalPages: number; total: number }
  onPageChange?: (page: number) => void
  search?: string
  onSearch?: (v: string) => void
  searchPlaceholder?: string
  actions?: ReactNode
  emptyText?: string
}

export function DataTable<T extends { id: number }>({
  columns, data, isLoading, pagination, onPageChange,
  search, onSearch, searchPlaceholder = 'Buscar...', actions, emptyText = 'Nenhum registro encontrado',
}: DataTableProps<T>) {
  return (
    <Box bg="card.bg" borderRadius="xl" border="1px solid" borderColor="gray.100" _dark={{ borderColor: 'whiteAlpha.100' }} overflow="hidden">
      {(onSearch || actions) && (
        <Flex p={4} gap={3} borderBottom="1px solid" borderColor="gray.100" _dark={{ borderColor: 'whiteAlpha.100' }} wrap="wrap">
          {onSearch && (
            <Flex align="center" gap={2} flex={1} minW="200px" maxW="360px" px={3} py={2} border="1px solid" borderColor="gray.200" _dark={{ borderColor: 'whiteAlpha.200' }} borderRadius="md" bg="gray.50">
              <Search size={16} color="#9ca3af" />
              <Input
                border="none"
                bg="transparent"
                p={0}
                fontSize="sm"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => onSearch(e.target.value)}
                _focus={{ outline: 'none', boxShadow: 'none' }}
              />
            </Flex>
          )}
          {actions && <Flex gap={2} ml="auto">{actions}</Flex>}
        </Flex>
      )}

      <Box overflowX="auto">
        <Table.Root size="sm">
          <Table.Header>
            <Table.Row bg="gray.50" _dark={{ bg: 'whiteAlpha.50' }}>
              {columns.map((col) => (
                <Table.ColumnHeader key={col.key} py={3} px={4} fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase" letterSpacing="wider" w={col.width}>
                  {col.label}
                </Table.ColumnHeader>
              ))}
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <Table.Row key={i}>
                    {columns.map((col) => (
                      <Table.Cell key={col.key} py={3} px={4}><Skeleton h="20px" borderRadius="md" /></Table.Cell>
                    ))}
                  </Table.Row>
                ))
              : data.length === 0
              ? (
                  <Table.Row>
                    <Table.Cell colSpan={columns.length}>
                      <Center py={12} color="gray.400"><Text fontSize="sm">{emptyText}</Text></Center>
                    </Table.Cell>
                  </Table.Row>
                )
              : data.map((row) => (
                  <Table.Row key={row.id} _hover={{ bg: 'gray.50', _dark: { bg: 'whiteAlpha.50' } }} transition="background 0.1s">
                    {columns.map((col) => (
                      <Table.Cell key={col.key} py={3} px={4} fontSize="sm">
                        {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '-')}
                      </Table.Cell>
                    ))}
                  </Table.Row>
                ))}
          </Table.Body>
        </Table.Root>
      </Box>

      {pagination && pagination.totalPages > 1 && (
        <Flex align="center" justify="space-between" p={4} borderTop="1px solid" borderColor="gray.100" _dark={{ borderColor: 'whiteAlpha.100' }}>
          <Text fontSize="xs" color="gray.500">{pagination.total} registro{pagination.total !== 1 ? 's' : ''}</Text>
          <Flex gap={1} align="center">
            <Button size="xs" variant="ghost" disabled={pagination.page <= 1} onClick={() => onPageChange?.(pagination.page - 1)}>
              <ChevronLeft size={14} />
            </Button>
            <Text fontSize="sm" px={3}>Pág. {pagination.page} de {pagination.totalPages}</Text>
            <Button size="xs" variant="ghost" disabled={pagination.page >= pagination.totalPages} onClick={() => onPageChange?.(pagination.page + 1)}>
              <ChevronRight size={14} />
            </Button>
          </Flex>
        </Flex>
      )}
    </Box>
  )
}
