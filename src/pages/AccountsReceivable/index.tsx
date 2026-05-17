import { useState } from 'react'
import { Button, Flex, Dialog, Field, Input, Select, Textarea, createListCollection, Text } from '@chakra-ui/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil, Trash2, CheckCircle } from 'lucide-react'
import { accountsReceivableApi, clientsApi, categoriesApi, paymentMethodsApi } from '@/services/finance'
import { DataTable } from '@/components/ui/DataTable'
import { PageHeader } from '@/components/ui/PageHeader'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { formatCurrency, formatDate } from '@/utils/format'
import type { AccountReceivable } from '@/types/finance'

const schema = z.object({
  description: z.string().min(3),
  amount: z.string().min(1),
  due_date: z.string().min(1),
  competence_date: z.string().optional(),
  client_id: z.string().optional(),
  category_id: z.string().optional(),
  payment_method_id: z.string().optional(),
  recurrence: z.string().optional(),
  observations: z.string().optional(),
})
type FormData = z.infer<typeof schema>

const recurrenceCollection = createListCollection({ items: [{ label: 'Sem recorrência', value: 'nenhuma' }, { label: 'Semanal', value: 'semanal' }, { label: 'Mensal', value: 'mensal' }, { label: 'Anual', value: 'anual' }] })
const statusFilterCollection = createListCollection({ items: [{ label: 'Todos', value: '' }, { label: 'Pendente', value: 'pendente' }, { label: 'Recebido', value: 'recebido' }, { label: 'Vencido', value: 'vencido' }, { label: 'Cancelado', value: 'cancelado' }] })

export function AccountsReceivablePage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [editing, setEditing] = useState<AccountReceivable | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [receiveTarget, setReceiveTarget] = useState<AccountReceivable | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AccountReceivable | null>(null)

  const { data, isLoading } = useQuery({ queryKey: ['accounts-receivable', page, search, statusFilter], queryFn: () => accountsReceivableApi.list({ page, limit: 10, search, status: statusFilter || undefined }) })
  const { data: clients } = useQuery({ queryKey: ['clients-all'], queryFn: () => clientsApi.list({ limit: 100, status: 'ativo' }) })
  const { data: categories } = useQuery({ queryKey: ['categories-all'], queryFn: () => categoriesApi.list({ limit: 100, status: 'ativo' }) })
  const { data: paymentMethods } = useQuery({ queryKey: ['payment-methods-all'], queryFn: () => paymentMethodsApi.list({ limit: 100, status: 'ativo' }) })

  const clientCollection = createListCollection({ items: [{ label: 'Nenhum', value: '' }, ...(clients?.data ?? []).map(c => ({ label: c.name, value: String(c.id) }))] })
  const categoryCollection = createListCollection({ items: [{ label: 'Nenhuma', value: '' }, ...(categories?.data ?? []).filter(c => c.type !== 'despesa').map(c => ({ label: c.name, value: String(c.id) }))] })
  const paymentMethodCollection = createListCollection({ items: [{ label: 'Nenhuma', value: '' }, ...(paymentMethods?.data ?? []).map(p => ({ label: p.name, value: String(p.id) }))] })

  const save = useMutation({
    mutationFn: (d: FormData) => {
      const payload = { ...d, amount: Number(d.amount.replace(',', '.')), client_id: d.client_id ? Number(d.client_id) : undefined, category_id: d.category_id ? Number(d.category_id) : undefined, payment_method_id: d.payment_method_id ? Number(d.payment_method_id) : undefined }
      return editing ? accountsReceivableApi.update(editing.id, payload) : accountsReceivableApi.create(payload)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['accounts-receivable'] }); setModalOpen(false); setEditing(null) },
  })

  const receive = useMutation({ mutationFn: (item: AccountReceivable) => accountsReceivableApi.receive(item.id, { received_at: new Date().toISOString().slice(0, 10), received_amount: item.amount }), onSuccess: () => { qc.invalidateQueries({ queryKey: ['accounts-receivable'] }); setReceiveTarget(null) } })
  const remove = useMutation({ mutationFn: (id: number) => accountsReceivableApi.remove(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['accounts-receivable'] }); setDeleteTarget(null) } })

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { recurrence: 'nenhuma' } })

  const openEdit = (item: AccountReceivable) => {
    reset({ ...item, amount: String(item.amount), client_id: item.client_id ? String(item.client_id) : '', category_id: item.category_id ? String(item.category_id) : '', payment_method_id: item.payment_method_id ? String(item.payment_method_id) : '' })
    setEditing(item); setModalOpen(true)
  }

  const columns = [
    { key: 'description', label: 'Descrição' },
    { key: 'client_name', label: 'Cliente', render: (r: AccountReceivable) => r.client_name || '-' },
    { key: 'amount', label: 'Valor', render: (r: AccountReceivable) => <Text fontWeight="600" color="green.500">{formatCurrency(r.amount)}</Text> },
    { key: 'due_date', label: 'Vencimento', render: (r: AccountReceivable) => formatDate(r.due_date) },
    { key: 'status', label: 'Status', render: (r: AccountReceivable) => <StatusBadge status={r.status} /> },
    {
      key: 'actions', label: '', width: '120px', render: (r: AccountReceivable) => (
        <Flex gap={1}>
          {r.status === 'pendente' && <Button size="xs" variant="ghost" colorPalette="green" title="Receber" onClick={() => setReceiveTarget(r)}><CheckCircle size={14} /></Button>}
          <Button size="xs" variant="ghost" onClick={() => openEdit(r)}><Pencil size={14} /></Button>
          <Button size="xs" variant="ghost" colorPalette="red" onClick={() => setDeleteTarget(r)}><Trash2 size={14} /></Button>
        </Flex>
      )
    },
  ]

  const FilterBar = (
    <Flex gap={2} ml="auto">
      <Select.Root collection={statusFilterCollection} value={[statusFilter]} onValueChange={({ value }) => { setStatusFilter(value[0]); setPage(1) }} size="sm" w="150px">
        <Select.Trigger><Select.ValueText placeholder="Filtrar status" /></Select.Trigger>
        <Select.Positioner><Select.Content>{statusFilterCollection.items.map(i => <Select.Item key={i.value} item={i}>{i.label}</Select.Item>)}</Select.Content></Select.Positioner>
      </Select.Root>
      <Button colorPalette="blue" size="sm" onClick={() => { reset({ recurrence: 'nenhuma' }); setEditing(null); setModalOpen(true) }}><Plus size={16} />Nova Conta</Button>
    </Flex>
  )

  return (
    <>
      <PageHeader title="Contas a Receber" description="Gerencie os recebimentos da empresa" />
      <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading} pagination={data?.pagination} onPageChange={setPage} search={search} onSearch={(v) => { setSearch(v); setPage(1) }} searchPlaceholder="Buscar conta..." actions={FilterBar} />

      <Dialog.Root open={modalOpen} onOpenChange={({ open: o }) => { if (!o) { setModalOpen(false); setEditing(null) } }}>
        <Dialog.Backdrop /><Dialog.Positioner><Dialog.Content maxW="560px">
          <Dialog.Header><Dialog.Title>{editing ? 'Editar' : 'Nova'} Conta a Receber</Dialog.Title></Dialog.Header>
          <Dialog.Body>
            <form id="receivable-form" onSubmit={handleSubmit((d) => save.mutate(d))}>
              <Flex direction="column" gap={4}>
                <Field.Root invalid={!!errors.description}><Field.Label>Descrição *</Field.Label><Input {...register('description')} /><Field.ErrorText>{errors.description?.message}</Field.ErrorText></Field.Root>
                <Flex gap={3}>
                  <Field.Root flex={1} invalid={!!errors.amount}><Field.Label>Valor (R$) *</Field.Label><Input {...register('amount')} placeholder="0,00" /><Field.ErrorText>{errors.amount?.message}</Field.ErrorText></Field.Root>
                  <Field.Root flex={1} invalid={!!errors.due_date}><Field.Label>Vencimento *</Field.Label><Input type="date" {...register('due_date')} /><Field.ErrorText>{errors.due_date?.message}</Field.ErrorText></Field.Root>
                </Flex>
                <Flex gap={3}>
                  <Field.Root flex={1}><Field.Label>Cliente</Field.Label>
                    <Controller control={control} name="client_id" render={({ field }) => (
                      <Select.Root collection={clientCollection} value={[field.value || '']} onValueChange={({ value }) => field.onChange(value[0])}>
                        <Select.Trigger><Select.ValueText placeholder="Selecionar..." /></Select.Trigger>
                        <Select.Positioner><Select.Content>{clientCollection.items.map(i => <Select.Item key={i.value} item={i}>{i.label}</Select.Item>)}</Select.Content></Select.Positioner>
                      </Select.Root>
                    )} />
                  </Field.Root>
                  <Field.Root flex={1}><Field.Label>Categoria</Field.Label>
                    <Controller control={control} name="category_id" render={({ field }) => (
                      <Select.Root collection={categoryCollection} value={[field.value || '']} onValueChange={({ value }) => field.onChange(value[0])}>
                        <Select.Trigger><Select.ValueText placeholder="Selecionar..." /></Select.Trigger>
                        <Select.Positioner><Select.Content>{categoryCollection.items.map(i => <Select.Item key={i.value} item={i}>{i.label}</Select.Item>)}</Select.Content></Select.Positioner>
                      </Select.Root>
                    )} />
                  </Field.Root>
                </Flex>
                <Flex gap={3}>
                  <Field.Root flex={1}><Field.Label>Forma de Recebimento</Field.Label>
                    <Controller control={control} name="payment_method_id" render={({ field }) => (
                      <Select.Root collection={paymentMethodCollection} value={[field.value || '']} onValueChange={({ value }) => field.onChange(value[0])}>
                        <Select.Trigger><Select.ValueText placeholder="Selecionar..." /></Select.Trigger>
                        <Select.Positioner><Select.Content>{paymentMethodCollection.items.map(i => <Select.Item key={i.value} item={i}>{i.label}</Select.Item>)}</Select.Content></Select.Positioner>
                      </Select.Root>
                    )} />
                  </Field.Root>
                  <Field.Root flex={1}><Field.Label>Recorrência</Field.Label>
                    <Controller control={control} name="recurrence" render={({ field }) => (
                      <Select.Root collection={recurrenceCollection} value={[field.value || 'nenhuma']} onValueChange={({ value }) => field.onChange(value[0])}>
                        <Select.Trigger><Select.ValueText /></Select.Trigger>
                        <Select.Positioner><Select.Content>{recurrenceCollection.items.map(i => <Select.Item key={i.value} item={i}>{i.label}</Select.Item>)}</Select.Content></Select.Positioner>
                      </Select.Root>
                    )} />
                  </Field.Root>
                </Flex>
                <Field.Root><Field.Label>Observações</Field.Label><Textarea {...register('observations')} rows={2} /></Field.Root>
              </Flex>
            </form>
          </Dialog.Body>
          <Dialog.Footer gap={3}><Button variant="ghost" onClick={() => { setModalOpen(false); setEditing(null) }}>Cancelar</Button><Button form="receivable-form" type="submit" colorPalette="blue" loading={save.isPending}>Salvar</Button></Dialog.Footer>
        </Dialog.Content></Dialog.Positioner>
      </Dialog.Root>

      <ConfirmDialog open={!!receiveTarget} title="Confirmar Recebimento" description={`Confirmar recebimento de "${receiveTarget?.description}" (${formatCurrency(receiveTarget?.amount ?? 0)})?`} confirmLabel="Confirmar Recebimento" isLoading={receive.isPending} onConfirm={() => receiveTarget && receive.mutate(receiveTarget)} onClose={() => setReceiveTarget(null)} />
      <ConfirmDialog open={!!deleteTarget} title="Excluir Conta" description={`Deseja excluir "${deleteTarget?.description}"?`} isLoading={remove.isPending} onConfirm={() => deleteTarget && remove.mutate(deleteTarget.id)} onClose={() => setDeleteTarget(null)} />
    </>
  )
}
