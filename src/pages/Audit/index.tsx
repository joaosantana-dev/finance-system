import { useState } from 'react'
import { Text, Badge } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { auditApi } from '@/services/finance'
import { DataTable } from '@/components/ui/DataTable'
import { PageHeader } from '@/components/ui/PageHeader'
import { formatDateTime } from '@/utils/format'
import type { AuditLog } from '@/types/finance'

export function AuditPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({ queryKey: ['audit', page, search], queryFn: () => auditApi.list({ page, limit: 15 }) })

  const columns = [
    { key: 'created_at', label: 'Data/Hora', render: (r: AuditLog) => <Text fontSize="xs" color="gray.500">{formatDateTime(r.created_at)}</Text> },
    { key: 'user_name', label: 'Usuário', render: (r: AuditLog) => r.user_name || '-' },
    { key: 'action', label: 'Ação', render: (r: AuditLog) => <Badge colorPalette="blue" variant="subtle" size="sm">{r.action}</Badge> },
    { key: 'entity', label: 'Entidade', render: (r: AuditLog) => r.entity ? `${r.entity} #${r.entity_id}` : '-' },
    { key: 'ip_address', label: 'IP', render: (r: AuditLog) => r.ip_address || '-' },
  ]

  return (
    <>
      <PageHeader title="Auditoria" description="Histórico de ações realizadas no sistema" />
      <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading} pagination={data?.pagination} onPageChange={setPage} search={search} onSearch={(v) => { setSearch(v); setPage(1) }} searchPlaceholder="Buscar..." />
    </>
  )
}
