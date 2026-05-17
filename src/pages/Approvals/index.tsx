import { useState } from 'react'
import { Flex, Text, Button, Tabs } from '@chakra-ui/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, XCircle } from 'lucide-react'
import { accountsPayableApi, reimbursementsApi } from '@/services/finance'
import { DataTable } from '@/components/ui/DataTable'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { formatCurrency, formatDate } from '@/utils/format'
import type { AccountPayable, Reimbursement } from '@/types/finance'

export function ApprovalsPage() {
  const qc = useQueryClient()
  const [payablePage, setPayablePage] = useState(1)
  const [reimbPage, setReimbPage] = useState(1)

  const { data: payables, isLoading: loadingP } = useQuery({ queryKey: ['approvals-payable', payablePage], queryFn: () => accountsPayableApi.list({ page: payablePage, limit: 10, status: 'pendente' }) })
  const { data: reimbs, isLoading: loadingR } = useQuery({ queryKey: ['approvals-reimb', reimbPage], queryFn: () => reimbursementsApi.list({ page: reimbPage, limit: 10, status: 'pendente' }) })

  const payReimb = useMutation({ mutationFn: (id: number) => reimbursementsApi.approve(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['approvals-reimb'] }) })
  const rejectReimb = useMutation({ mutationFn: (id: number) => reimbursementsApi.reject(id, 'Reprovado pelo gestor.'), onSuccess: () => qc.invalidateQueries({ queryKey: ['approvals-reimb'] }) })
  const cancelPayable = useMutation({ mutationFn: (id: number) => accountsPayableApi.cancel(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['approvals-payable'] }) })

  const payableColumns = [
    { key: 'description', label: 'Descrição' },
    { key: 'supplier_name', label: 'Fornecedor', render: (r: AccountPayable) => r.supplier_name || '-' },
    { key: 'amount', label: 'Valor', render: (r: AccountPayable) => <Text fontWeight="600" color="red.500">{formatCurrency(r.amount)}</Text> },
    { key: 'due_date', label: 'Vencimento', render: (r: AccountPayable) => formatDate(r.due_date) },
    { key: 'status', label: 'Status', render: (r: AccountPayable) => <StatusBadge status={r.status} /> },
    { key: 'actions', label: '', width: '100px', render: (r: AccountPayable) => (<Flex gap={1}><Button size="xs" colorPalette="red" variant="ghost" title="Cancelar" onClick={() => cancelPayable.mutate(r.id)}><XCircle size={14} /></Button></Flex>) },
  ]

  const reimbColumns = [
    { key: 'requester_name', label: 'Solicitante', render: (r: Reimbursement) => r.requester_name || '-' },
    { key: 'description', label: 'Descrição' },
    { key: 'amount', label: 'Valor', render: (r: Reimbursement) => <Text fontWeight="600">{formatCurrency(r.amount)}</Text> },
    { key: 'receipt_date', label: 'Data', render: (r: Reimbursement) => formatDate(r.receipt_date) },
    { key: 'status', label: 'Status', render: (r: Reimbursement) => <StatusBadge status={r.status} /> },
    {
      key: 'actions', label: '', width: '100px', render: (r: Reimbursement) => (
        <Flex gap={1}>
          <Button size="xs" colorPalette="green" variant="ghost" title="Aprovar" onClick={() => payReimb.mutate(r.id)}><CheckCircle size={14} /></Button>
          <Button size="xs" colorPalette="red" variant="ghost" title="Rejeitar" onClick={() => rejectReimb.mutate(r.id)}><XCircle size={14} /></Button>
        </Flex>
      )
    },
  ]

  return (
    <>
      <PageHeader title="Aprovações" description="Itens pendentes de aprovação" />
      <Tabs.Root defaultValue="payable" variant="line">
        <Tabs.List mb={4}>
          <Tabs.Trigger value="payable">Contas a Pagar ({payables?.pagination.total ?? 0})</Tabs.Trigger>
          <Tabs.Trigger value="reimb">Reembolsos ({reimbs?.pagination.total ?? 0})</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="payable">
          <DataTable columns={payableColumns} data={payables?.data ?? []} isLoading={loadingP} pagination={payables?.pagination} onPageChange={setPayablePage} emptyText="Nenhuma conta pendente de aprovação" />
        </Tabs.Content>
        <Tabs.Content value="reimb">
          <DataTable columns={reimbColumns} data={reimbs?.data ?? []} isLoading={loadingR} pagination={reimbs?.pagination} onPageChange={setReimbPage} emptyText="Nenhum reembolso pendente de aprovação" />
        </Tabs.Content>
      </Tabs.Root>
    </>
  )
}
