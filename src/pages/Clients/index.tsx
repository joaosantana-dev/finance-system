import { useState } from 'react'
import { Button, Flex, Dialog, Field, Input, Select, createListCollection } from '@chakra-ui/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { clientsApi } from '@/services/finance'
import { DataTable } from '@/components/ui/DataTable'
import { PageHeader } from '@/components/ui/PageHeader'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { Client } from '@/types/finance'

const schema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  type: z.enum(['pf', 'pj']),
  document: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(['ativo', 'inativo']),
})
type FormData = z.infer<typeof schema>

const typeCollection = createListCollection({ items: [{ label: 'Pessoa Jurídica', value: 'pj' }, { label: 'Pessoa Física', value: 'pf' }] })
const statusCollection = createListCollection({ items: [{ label: 'Ativo', value: 'ativo' }, { label: 'Inativo', value: 'inativo' }] })

export function ClientsPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Client | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null)

  const { data, isLoading } = useQuery({ queryKey: ['clients', page, search], queryFn: () => clientsApi.list({ page, limit: 10, search }) })

  const save = useMutation({
    mutationFn: (d: FormData) => editing ? clientsApi.update(editing.id, d) : clientsApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clients'] }); setModalOpen(false); setEditing(null) },
  })

  const remove = useMutation({
    mutationFn: (id: number) => clientsApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clients'] }); setDeleteTarget(null) },
  })

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { type: 'pj', status: 'ativo' } })

  const openCreate = () => { reset({ type: 'pj', status: 'ativo' }); setEditing(null); setModalOpen(true) }
  const openEdit = (c: Client) => { reset(c as FormData); setEditing(c); setModalOpen(true) }

  const columns = [
    { key: 'name', label: 'Cliente' },
    { key: 'type', label: 'Tipo', render: (r: Client) => r.type === 'pj' ? 'PJ' : 'PF' },
    { key: 'document', label: 'CNPJ/CPF', render: (r: Client) => r.document || '-' },
    { key: 'email', label: 'E-mail', render: (r: Client) => r.email || '-' },
    { key: 'phone', label: 'Telefone', render: (r: Client) => r.phone || '-' },
    { key: 'status', label: 'Status', render: (r: Client) => <StatusBadge status={r.status} /> },
    {
      key: 'actions', label: '', width: '100px', render: (r: Client) => (
        <Flex gap={1}><Button size="xs" variant="ghost" onClick={() => openEdit(r)}><Pencil size={14} /></Button><Button size="xs" variant="ghost" colorPalette="red" onClick={() => setDeleteTarget(r)}><Trash2 size={14} /></Button></Flex>
      )
    },
  ]

  return (
    <>
      <PageHeader title="Clientes" description="Gerencie a carteira de clientes" actions={<Button colorPalette="blue" size="sm" onClick={openCreate}><Plus size={16} />Novo Cliente</Button>} />
      <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading} pagination={data?.pagination} onPageChange={setPage} search={search} onSearch={(v) => { setSearch(v); setPage(1) }} searchPlaceholder="Buscar cliente..." />

      <Dialog.Root open={modalOpen} onOpenChange={({ open: o }) => { if (!o) { setModalOpen(false); setEditing(null) } }}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="500px">
            <Dialog.Header><Dialog.Title>{editing ? 'Editar' : 'Novo'} Cliente</Dialog.Title></Dialog.Header>
            <Dialog.Body>
              <form id="client-form" onSubmit={handleSubmit((d) => save.mutate(d))}>
                <Flex direction="column" gap={4}>
                  <Field.Root invalid={!!errors.name}><Field.Label>Nome *</Field.Label><Input {...register('name')} /><Field.ErrorText>{errors.name?.message}</Field.ErrorText></Field.Root>
                  <Flex gap={3}>
                    <Field.Root flex={1}><Field.Label>Tipo</Field.Label>
                      <Controller control={control} name="type" render={({ field }) => (
                        <Select.Root collection={typeCollection} value={[field.value]} onValueChange={({ value }) => field.onChange(value[0])}>
                          <Select.Trigger><Select.ValueText /></Select.Trigger>
                          <Select.Positioner><Select.Content>{typeCollection.items.map(i => <Select.Item key={i.value} item={i}>{i.label}</Select.Item>)}</Select.Content></Select.Positioner>
                        </Select.Root>
                      )} />
                    </Field.Root>
                    <Field.Root flex={1}><Field.Label>CNPJ/CPF</Field.Label><Input {...register('document')} /></Field.Root>
                  </Flex>
                  <Flex gap={3}>
                    <Field.Root flex={1} invalid={!!errors.email}><Field.Label>E-mail</Field.Label><Input {...register('email')} /><Field.ErrorText>{errors.email?.message}</Field.ErrorText></Field.Root>
                    <Field.Root flex={1}><Field.Label>Telefone</Field.Label><Input {...register('phone')} /></Field.Root>
                  </Flex>
                  <Field.Root><Field.Label>Endereço</Field.Label><Input {...register('address')} /></Field.Root>
                  <Field.Root><Field.Label>Status</Field.Label>
                    <Controller control={control} name="status" render={({ field }) => (
                      <Select.Root collection={statusCollection} value={[field.value]} onValueChange={({ value }) => field.onChange(value[0])}>
                        <Select.Trigger><Select.ValueText /></Select.Trigger>
                        <Select.Positioner><Select.Content>{statusCollection.items.map(i => <Select.Item key={i.value} item={i}>{i.label}</Select.Item>)}</Select.Content></Select.Positioner>
                      </Select.Root>
                    )} />
                  </Field.Root>
                </Flex>
              </form>
            </Dialog.Body>
            <Dialog.Footer gap={3}>
              <Button variant="ghost" onClick={() => { setModalOpen(false); setEditing(null) }}>Cancelar</Button>
              <Button form="client-form" type="submit" colorPalette="blue" loading={save.isPending}>Salvar</Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

      <ConfirmDialog open={!!deleteTarget} title="Excluir Cliente" description={`Deseja excluir "${deleteTarget?.name}"?`} isLoading={remove.isPending} onConfirm={() => deleteTarget && remove.mutate(deleteTarget.id)} onClose={() => setDeleteTarget(null)} />
    </>
  )
}
