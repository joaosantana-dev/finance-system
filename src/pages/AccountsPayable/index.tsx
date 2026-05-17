import { useState } from 'react'
import { Button, Flex, Dialog, Field, Input, Select, Textarea, createListCollection, Text, Badge } from '@chakra-ui/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil, Trash2, CheckCircle } from 'lucide-react'
import { accountsPayableApi, suppliersApi, categoriesApi, costCentersApi, paymentMethodsApi } from '@/services/finance'
import { DataTable } from '@/components/ui/DataTable'
import { PageHeader } from '@/components/ui/PageHeader'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { formatCurrency, formatDate } from '@/utils/format'
import type { AccountPayable } from '@/types/finance'

const schema = z.object({
  description: z.string().min(3, 'Descrição obrigatória'),
  amount: z.string().min(1, 'Valor obrigatório'),
  due_date: z.string().min(1, 'Vencimento obrigatório'),
  competence_date: z.string().optional(),
  supplier_id: z.string().optional(),
  category_id: z.string().optional(),
  cost_center_id: z.string().optional(),
  payment_method_id: z.string().optional(),
  recurrence: z.string().optional(),
  observations: z.string().optional(),
})
type FormData = z.infer<typeof schema>

const recurrenceCollection = createListCollection({ items: [{ label: 'Sem recorrência', value: 'nenhuma' }, { label: 'Semanal', value: 'semanal' }, { label: 'Mensal', value: 'mensal' }, { label: 'Anual', value: 'anual' }] })
const statusFilterCollection = createListCollection({ items: [{ label: 'Todos', value: '' }, { label: 'Pendente', value: 'pendente' }, { label: 'Pago', value: 'pago' }, { label: 'Vencido', value: 'vencido' }, { label: 'Cancelado', value: 'cancelado' }] })

export function AccountsPayablePage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [editing, setEditing] = useState<AccountPayable | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [payTarget, setPayTarget] = useState<AccountPayable | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AccountPayable | null>(null)

  const { data, isLoading } = useQuery({ queryKey: ['accounts-payable', page, search, statusFilter], queryFn: () => accountsPayableApi.list({ page, limit: 10, search, status: statusFilter || undefined }) })
  const { data: suppliers } = useQuery({ queryKey: ['suppliers-all'], queryFn: () => suppliersApi.list({ limit: 100, status: 'ativo' }) })
  const { data: categories } = useQuery({ queryKey: ['categories-all'], queryFn: () => categoriesApi.list({ limit: 100, status: 'ativo' }) })
  const { data: costCenters } = useQuery({ queryKey: ['cost-centers-all'], queryFn: () => costCentersApi.list({ limit: 100, status: 'ativo' }) })
  const { data: paymentMethods } = useQuery({ queryKey: ['payment-methods-all'], queryFn: () => paymentMethodsApi.list({ limit: 100, status: 'ativo' }) })

  const supplierCollection = createListCollection({ items: [{ label: 'Nenhum', value: '' }, ...(suppliers?.data ?? []).map(s => ({ label: s.name, value: String(s.id) }))] })
  const categoryCollection = createListCollection({ items: [{ label: 'Nenhuma', value: '' }, ...(categories?.data ?? []).filter(c => c.type !== 'receita').map(c => ({ label: c.name, value: String(c.id) }))] })
  const costCenterCollection = createListCollection({ items: [{ label: 'Nenhum', value: '' }, ...(costCenters?.data ?? []).map(c => ({ label: c.name, value: String(c.id) }))] })
  const paymentMethodCollection = createListCollection({ items: [{ label: 'Nenhuma', value: '' }, ...(paymentMethods?.data ?? []).map(p => ({ label: p.name, value: String(p.id) }))] })

  const save = useMutation({
    mutationFn: (d: FormData) => {
      const payload = { ...d, amount: Number(d.amount.replace(',', '.')), supplier_id: d.supplier_id ? Number(d.supplier_id) : undefined, category_id: d.category_id ? Number(d.category_id) : undefined, cost_center_id: d.cost_center_id ? Number(d.cost_center_id) : undefined, payment_method_id: d.payment_method_id ? Number(d.payment_method_id) : undefined }
      return editing ? accountsPayableApi.update(editing.id, payload) : accountsPayableApi.create(payload)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['accounts-payable'] }); setModalOpen(false); setEditing(null) },
  })

  const pay = useMutation({
    mutationFn: (item: AccountPayable) => accountsPayableApi.pay(item.id, { paid_at: new Date().toISOString().slice(0, 10), paid_amount: item.amount }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['accounts-payable'] }); setPayTarget(null) },
  })

  const remove = useMutation({ mutationFn: (id: number) => accountsPayableApi.remove(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['accounts-payable'] }); setDeleteTarget(null) } })

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { recurrence: 'nenhuma' } })

  const openEdit = (item: AccountPayable) => {
    reset({ ...item, amount: String(item.amount), supplier_id: item.supplier_id ? String(item.supplier_id) : '', category_id: item.category_id ? String(item.category_id) : '', cost_center_id: item.cost_center_id ? String(item.cost_center_id) : '', payment_method_id: item.payment_method_id ? String(item.payment_method_id) : '' })
    setEditing(item); setModalOpen(true)
  }

  const columns = [
    { key: 'description', label: 'Descrição', render: (r: AccountPayable) => <Text fontSize="sm" fontWeight="500">{r.description}{r.installment_number ? <Badge ml={2} size="sm" colorPalette="gray">{r.installment_number}/{r.total_installments}</Badge> : null}</Text> },
    { key: 'supplier_name', label: 'Fornecedor', render: (r: AccountPayable) => r.supplier_name || '-' },
    { key: 'category_name', label: 'Categoria', render: (r: AccountPayable) => r.category_name || '-' },
    { key: 'amount', label: 'Valor', render: (r: AccountPayable) => <Text fontWeight="600" color="red.500">{formatCurrency(r.amount)}</Text> },
    { key: 'due_date', label: 'Vencimento', render: (r: AccountPayable) => formatDate(r.due_date) },
    { key: 'status', label: 'Status', render: (r: AccountPayable) => <StatusBadge status={r.status} /> },
    {
      key: 'actions', label: '', width: '120px', render: (r: AccountPayable) => (
        <Flex gap={1}>
          {r.status === 'pendente' && <Button size="xs" variant="ghost" colorPalette="green" title="Dar baixa" onClick={() => setPayTarget(r)}><CheckCircle size={14} /></Button>}
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
      <PageHeader title="Contas a Pagar" description="Gerencie as obrigações financeiras da empresa" />
      <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading} pagination={data?.pagination} onPageChange={setPage} search={search} onSearch={(v) => { setSearch(v); setPage(1) }} searchPlaceholder="Buscar conta..." actions={FilterBar} />

      <Dialog.Root open={modalOpen} onOpenChange={({ open: o }) => { if (!o) { setModalOpen(false); setEditing(null) } }}>
        <Dialog.Backdrop /><Dialog.Positioner><Dialog.Content maxW="560px">
          <Dialog.Header><Dialog.Title>{editing ? 'Editar' : 'Nova'} Conta a Pagar</Dialog.Title></Dialog.Header>
          <Dialog.Body>
            <form id="payable-form" onSubmit={handleSubmit((d) => save.mutate(d))}>
              <Flex direction="column" gap={4}>
                <Field.Root invalid={!!errors.description}><Field.Label>Descrição *</Field.Label><Input {...register('description')} /><Field.ErrorText>{errors.description?.message}</Field.ErrorText></Field.Root>
                <Flex gap={3}>
                  <Field.Root flex={1} invalid={!!errors.amount}><Field.Label>Valor (R$) *</Field.Label><Input {...register('amount')} placeholder="0,00" /><Field.ErrorText>{errors.amount?.message}</Field.ErrorText></Field.Root>
                  <Field.Root flex={1} invalid={!!errors.due_date}><Field.Label>Vencimento *</Field.Label><Input type="date" {...register('due_date')} /><Field.ErrorText>{errors.due_date?.message}</Field.ErrorText></Field.Root>
                </Flex>
                <Field.Root><Field.Label>Competência</Field.Label><Input type="date" {...register('competence_date')} /></Field.Root>
                <Flex gap={3}>
                  <Field.Root flex={1}><Field.Label>Fornecedor</Field.Label>
                    <Controller control={control} name="supplier_id" render={({ field }) => (
                      <Select.Root collection={supplierCollection} value={[field.value || '']} onValueChange={({ value }) => field.onChange(value[0])}>
                        <Select.Trigger><Select.ValueText placeholder="Selecionar..." /></Select.Trigger>
                        <Select.Positioner><Select.Content>{supplierCollection.items.map(i => <Select.Item key={i.value} item={i}>{i.label}</Select.Item>)}</Select.Content></Select.Positioner>
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
                  <Field.Root flex={1}><Field.Label>Centro de Custo</Field.Label>
                    <Controller control={control} name="cost_center_id" render={({ field }) => (
                      <Select.Root collection={costCenterCollection} value={[field.value || '']} onValueChange={({ value }) => field.onChange(value[0])}>
                        <Select.Trigger><Select.ValueText placeholder="Selecionar..." /></Select.Trigger>
                        <Select.Positioner><Select.Content>{costCenterCollection.items.map(i => <Select.Item key={i.value} item={i}>{i.label}</Select.Item>)}</Select.Content></Select.Positioner>
                      </Select.Root>
                    )} />
                  </Field.Root>
                  <Field.Root flex={1}><Field.Label>Forma de Pgto.</Field.Label>
                    <Controller control={control} name="payment_method_id" render={({ field }) => (
                      <Select.Root collection={paymentMethodCollection} value={[field.value || '']} onValueChange={({ value }) => field.onChange(value[0])}>
                        <Select.Trigger><Select.ValueText placeholder="Selecionar..." /></Select.Trigger>
                        <Select.Positioner><Select.Content>{paymentMethodCollection.items.map(i => <Select.Item key={i.value} item={i}>{i.label}</Select.Item>)}</Select.Content></Select.Positioner>
                      </Select.Root>
                    )} />
                  </Field.Root>
                </Flex>
                <Field.Root><Field.Label>Recorrência</Field.Label>
                  <Controller control={control} name="recurrence" render={({ field }) => (
                    <Select.Root collection={recurrenceCollection} value={[field.value || 'nenhuma']} onValueChange={({ value }) => field.onChange(value[0])}>
                      <Select.Trigger><Select.ValueText /></Select.Trigger>
                      <Select.Positioner><Select.Content>{recurrenceCollection.items.map(i => <Select.Item key={i.value} item={i}>{i.label}</Select.Item>)}</Select.Content></Select.Positioner>
                    </Select.Root>
                  )} />
                </Field.Root>
                <Field.Root><Field.Label>Observações</Field.Label><Textarea {...register('observations')} rows={2} /></Field.Root>
              </Flex>
            </form>
          </Dialog.Body>
          <Dialog.Footer gap={3}><Button variant="ghost" onClick={() => { setModalOpen(false); setEditing(null) }}>Cancelar</Button><Button form="payable-form" type="submit" colorPalette="blue" loading={save.isPending}>Salvar</Button></Dialog.Footer>
        </Dialog.Content></Dialog.Positioner>
      </Dialog.Root>

      <ConfirmDialog open={!!payTarget} title="Confirmar Baixa" description={`Dar baixa em "${payTarget?.description}" (${formatCurrency(payTarget?.amount ?? 0)})?`} confirmLabel="Confirmar Pagamento" isLoading={pay.isPending} onConfirm={() => payTarget && pay.mutate(payTarget)} onClose={() => setPayTarget(null)} />
      <ConfirmDialog open={!!deleteTarget} title="Excluir Conta" description={`Deseja excluir "${deleteTarget?.description}"?`} isLoading={remove.isPending} onConfirm={() => deleteTarget && remove.mutate(deleteTarget.id)} onClose={() => setDeleteTarget(null)} />
    </>
  )
}
