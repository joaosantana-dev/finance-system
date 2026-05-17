import { useState } from 'react'
import { Button, Flex, Dialog, Field, Input, Select, Textarea, createListCollection, Text } from '@chakra-ui/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil, CheckCircle, XCircle, DollarSign } from 'lucide-react'
import { reimbursementsApi } from '@/services/finance'
import { DataTable } from '@/components/ui/DataTable'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { formatCurrency, formatDate } from '@/utils/format'
import { useAuth } from '@/hooks/useAuth'
import type { Reimbursement } from '@/types/finance'

const schema = z.object({
  type: z.enum(['alimentacao', 'transporte', 'hospedagem', 'combustivel', 'outros']),
  description: z.string().min(3),
  amount: z.string().min(1),
  receipt_date: z.string().min(1),
  observations: z.string().optional(),
})
type FormData = z.infer<typeof schema>

const typeCollection = createListCollection({ items: [{ label: 'Alimentação', value: 'alimentacao' }, { label: 'Transporte', value: 'transporte' }, { label: 'Hospedagem', value: 'hospedagem' }, { label: 'Combustível', value: 'combustivel' }, { label: 'Outros', value: 'outros' }] })
const statusFilterCollection = createListCollection({ items: [{ label: 'Todos', value: '' }, { label: 'Pendente', value: 'pendente' }, { label: 'Aprovado', value: 'aprovado' }, { label: 'Rejeitado', value: 'rejeitado' }, { label: 'Pago', value: 'pago' }] })
const typeLabel: Record<string, string> = { alimentacao: 'Alimentação', transporte: 'Transporte', hospedagem: 'Hospedagem', combustivel: 'Combustível', outros: 'Outros' }

export function ReimbursementsPage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [editing, setEditing] = useState<Reimbursement | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [rejectTarget, setRejectTarget] = useState<Reimbursement | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const { data, isLoading } = useQuery({ queryKey: ['reimbursements', page, search, statusFilter], queryFn: () => reimbursementsApi.list({ page, limit: 10, search, status: statusFilter || undefined }) })

  const save = useMutation({ mutationFn: (d: FormData) => { const p = { ...d, amount: Number(d.amount.replace(',', '.')) }; return editing ? reimbursementsApi.update(editing.id, p) : reimbursementsApi.create(p) }, onSuccess: () => { qc.invalidateQueries({ queryKey: ['reimbursements'] }); setModalOpen(false); setEditing(null) } })
  const approve = useMutation({ mutationFn: (id: number) => reimbursementsApi.approve(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['reimbursements'] }) })
  const reject = useMutation({ mutationFn: ({ id, reason }: { id: number; reason: string }) => reimbursementsApi.reject(id, reason), onSuccess: () => { qc.invalidateQueries({ queryKey: ['reimbursements'] }); setRejectTarget(null); setRejectReason('') } })
  const pay = useMutation({ mutationFn: (id: number) => reimbursementsApi.pay(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['reimbursements'] }) })

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { type: 'alimentacao' } })

  const canApprove = ['admin', 'financeiro', 'gestor'].includes(user?.role ?? '')

  const columns = [
    { key: 'requester_name', label: 'Solicitante', render: (r: Reimbursement) => r.requester_name || '-' },
    { key: 'type', label: 'Tipo', render: (r: Reimbursement) => typeLabel[r.type] },
    { key: 'description', label: 'Descrição' },
    { key: 'amount', label: 'Valor', render: (r: Reimbursement) => <Text fontWeight="600">{formatCurrency(r.amount)}</Text> },
    { key: 'receipt_date', label: 'Data', render: (r: Reimbursement) => formatDate(r.receipt_date) },
    { key: 'status', label: 'Status', render: (r: Reimbursement) => <StatusBadge status={r.status} /> },
    {
      key: 'actions', label: '', width: '160px', render: (r: Reimbursement) => (
        <Flex gap={1}>
          {r.status === 'pendente' && <Button size="xs" variant="ghost" onClick={() => { reset({ type: r.type, description: r.description, amount: String(r.amount), receipt_date: r.receipt_date, observations: r.observations ?? '' }); setEditing(r); setModalOpen(true) }}><Pencil size={14} /></Button>}
          {r.status === 'pendente' && canApprove && <Button size="xs" variant="ghost" colorPalette="green" title="Aprovar" onClick={() => approve.mutate(r.id)}><CheckCircle size={14} /></Button>}
          {r.status === 'pendente' && canApprove && <Button size="xs" variant="ghost" colorPalette="red" title="Rejeitar" onClick={() => setRejectTarget(r)}><XCircle size={14} /></Button>}
          {r.status === 'aprovado' && user?.role === 'financeiro' || user?.role === 'admin' ? <Button size="xs" variant="ghost" colorPalette="blue" title="Pagar" onClick={() => pay.mutate(r.id)}><DollarSign size={14} /></Button> : null}
        </Flex>
      )
    },
  ]

  return (
    <>
      <PageHeader title="Reembolsos" description="Solicitações de reembolso corporativo" actions={
        <Flex gap={2}>
          <Select.Root collection={statusFilterCollection} value={[statusFilter]} onValueChange={({ value }) => { setStatusFilter(value[0]); setPage(1) }} size="sm" w="150px">
            <Select.Trigger><Select.ValueText placeholder="Status" /></Select.Trigger>
            <Select.Positioner><Select.Content>{statusFilterCollection.items.map(i => <Select.Item key={i.value} item={i}>{i.label}</Select.Item>)}</Select.Content></Select.Positioner>
          </Select.Root>
          <Button colorPalette="blue" size="sm" onClick={() => { reset({ type: 'alimentacao' }); setEditing(null); setModalOpen(true) }}><Plus size={16} />Nova Solicitação</Button>
        </Flex>
      } />
      <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading} pagination={data?.pagination} onPageChange={setPage} search={search} onSearch={(v) => { setSearch(v); setPage(1) }} searchPlaceholder="Buscar reembolso..." />

      <Dialog.Root open={modalOpen} onOpenChange={({ open: o }) => { if (!o) { setModalOpen(false); setEditing(null) } }}>
        <Dialog.Backdrop /><Dialog.Positioner><Dialog.Content maxW="500px">
          <Dialog.Header><Dialog.Title>{editing ? 'Editar' : 'Nova'} Solicitação</Dialog.Title></Dialog.Header>
          <Dialog.Body>
            <form id="reimb-form" onSubmit={handleSubmit((d) => save.mutate(d))}>
              <Flex direction="column" gap={4}>
                <Field.Root><Field.Label>Tipo *</Field.Label>
                  <Controller control={control} name="type" render={({ field }) => (
                    <Select.Root collection={typeCollection} value={[field.value]} onValueChange={({ value }) => field.onChange(value[0])}>
                      <Select.Trigger><Select.ValueText /></Select.Trigger>
                      <Select.Positioner><Select.Content>{typeCollection.items.map(i => <Select.Item key={i.value} item={i}>{i.label}</Select.Item>)}</Select.Content></Select.Positioner>
                    </Select.Root>
                  )} />
                </Field.Root>
                <Field.Root invalid={!!errors.description}><Field.Label>Descrição *</Field.Label><Input {...register('description')} /><Field.ErrorText>{errors.description?.message}</Field.ErrorText></Field.Root>
                <Flex gap={3}>
                  <Field.Root flex={1} invalid={!!errors.amount}><Field.Label>Valor (R$) *</Field.Label><Input {...register('amount')} placeholder="0,00" /><Field.ErrorText>{errors.amount?.message}</Field.ErrorText></Field.Root>
                  <Field.Root flex={1} invalid={!!errors.receipt_date}><Field.Label>Data do Comprovante *</Field.Label><Input type="date" {...register('receipt_date')} /><Field.ErrorText>{errors.receipt_date?.message}</Field.ErrorText></Field.Root>
                </Flex>
                <Field.Root><Field.Label>Observações</Field.Label><Textarea {...register('observations')} rows={2} /></Field.Root>
              </Flex>
            </form>
          </Dialog.Body>
          <Dialog.Footer gap={3}><Button variant="ghost" onClick={() => { setModalOpen(false); setEditing(null) }}>Cancelar</Button><Button form="reimb-form" type="submit" colorPalette="blue" loading={save.isPending}>Enviar Solicitação</Button></Dialog.Footer>
        </Dialog.Content></Dialog.Positioner>
      </Dialog.Root>

      <Dialog.Root open={!!rejectTarget} onOpenChange={({ open: o }) => { if (!o) setRejectTarget(null) }}>
        <Dialog.Backdrop /><Dialog.Positioner><Dialog.Content maxW="440px">
          <Dialog.Header><Dialog.Title>Rejeitar Reembolso</Dialog.Title></Dialog.Header>
          <Dialog.Body>
            <Flex direction="column" gap={3}>
              <Text fontSize="sm">Informe o motivo da rejeição para "{rejectTarget?.description}".</Text>
              <Field.Root><Field.Label>Motivo *</Field.Label><Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} /></Field.Root>
            </Flex>
          </Dialog.Body>
          <Dialog.Footer gap={3}>
            <Button variant="ghost" onClick={() => setRejectTarget(null)}>Cancelar</Button>
            <Button colorPalette="red" disabled={!rejectReason.trim()} loading={reject.isPending} onClick={() => rejectTarget && reject.mutate({ id: rejectTarget.id, reason: rejectReason })}>Rejeitar</Button>
          </Dialog.Footer>
        </Dialog.Content></Dialog.Positioner>
      </Dialog.Root>
    </>
  )
}
