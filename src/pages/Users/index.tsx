import { useState } from 'react'
import { Button, Flex, Dialog, Field, Input, Select, createListCollection, Text } from '@chakra-ui/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil, UserX } from 'lucide-react'
import { usersApi } from '@/services/finance'
import { DataTable } from '@/components/ui/DataTable'
import { PageHeader } from '@/components/ui/PageHeader'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { formatDateTime } from '@/utils/format'
import type { FinanceUser } from '@/types/finance'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres').optional().or(z.literal('')),
  role: z.enum(['admin', 'financeiro', 'gestor', 'rh', 'visualizador']),
  phone: z.string().optional(),
  status: z.enum(['ativo', 'inativo']),
})
type FormData = z.infer<typeof schema>

const roleCollection = createListCollection({ items: [{ label: 'Administrador', value: 'admin' }, { label: 'Financeiro', value: 'financeiro' }, { label: 'Gestor', value: 'gestor' }, { label: 'RH', value: 'rh' }, { label: 'Visualizador', value: 'visualizador' }] })
const statusCollection = createListCollection({ items: [{ label: 'Ativo', value: 'ativo' }, { label: 'Inativo', value: 'inativo' }] })
const roleLabel: Record<string, string> = { admin: 'Administrador', financeiro: 'Financeiro', gestor: 'Gestor', rh: 'RH', visualizador: 'Visualizador' }

export function UsersPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<FinanceUser | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [deactivateTarget, setDeactivateTarget] = useState<FinanceUser | null>(null)

  const { data, isLoading } = useQuery({ queryKey: ['users', page, search], queryFn: () => usersApi.list({ page, limit: 10, search }) })
  const save = useMutation({ mutationFn: (d: FormData) => editing ? usersApi.update(editing.id, d) : usersApi.create(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setModalOpen(false); setEditing(null) } })
  const deactivate = useMutation({ mutationFn: (id: number) => usersApi.remove(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setDeactivateTarget(null) } })

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { role: 'visualizador', status: 'ativo' } })

  const openEdit = (u: FinanceUser) => { reset({ name: u.name, email: u.email, role: u.role as FormData['role'], phone: u.phone, status: u.status, password: '' }); setEditing(u); setModalOpen(true) }

  const columns = [
    { key: 'name', label: 'Nome', render: (r: FinanceUser) => <Text fontWeight="500">{r.name}</Text> },
    { key: 'email', label: 'E-mail' },
    { key: 'role', label: 'Perfil', render: (r: FinanceUser) => roleLabel[r.role] || r.role },
    { key: 'last_login_at', label: 'Último acesso', render: (r: FinanceUser) => formatDateTime(r.last_login_at) },
    { key: 'status', label: 'Status', render: (r: FinanceUser) => <StatusBadge status={r.status} /> },
    { key: 'actions', label: '', width: '100px', render: (r: FinanceUser) => (<Flex gap={1}><Button size="xs" variant="ghost" onClick={() => openEdit(r)}><Pencil size={14} /></Button><Button size="xs" variant="ghost" colorPalette="red" onClick={() => setDeactivateTarget(r)}><UserX size={14} /></Button></Flex>) },
  ]

  return (
    <>
      <PageHeader title="Usuários" description="Gerencie os usuários e permissões do sistema" actions={<Button colorPalette="blue" size="sm" onClick={() => { reset({ role: 'visualizador', status: 'ativo', password: '' }); setEditing(null); setModalOpen(true) }}><Plus size={16} />Novo Usuário</Button>} />
      <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading} pagination={data?.pagination} onPageChange={setPage} search={search} onSearch={(v) => { setSearch(v); setPage(1) }} searchPlaceholder="Buscar usuário..." />

      <Dialog.Root open={modalOpen} onOpenChange={({ open: o }) => { if (!o) { setModalOpen(false); setEditing(null) } }}>
        <Dialog.Backdrop /><Dialog.Positioner><Dialog.Content maxW="480px">
          <Dialog.Header><Dialog.Title>{editing ? 'Editar' : 'Novo'} Usuário</Dialog.Title></Dialog.Header>
          <Dialog.Body>
            <form id="user-form" onSubmit={handleSubmit((d) => save.mutate(d))}>
              <Flex direction="column" gap={4}>
                <Field.Root invalid={!!errors.name}><Field.Label>Nome *</Field.Label><Input {...register('name')} /><Field.ErrorText>{errors.name?.message}</Field.ErrorText></Field.Root>
                <Field.Root invalid={!!errors.email}><Field.Label>E-mail *</Field.Label><Input {...register('email')} /><Field.ErrorText>{errors.email?.message}</Field.ErrorText></Field.Root>
                <Field.Root invalid={!!errors.password}><Field.Label>{editing ? 'Nova Senha (deixe vazio para não alterar)' : 'Senha *'}</Field.Label><Input type="password" {...register('password')} /><Field.ErrorText>{errors.password?.message}</Field.ErrorText></Field.Root>
                <Field.Root><Field.Label>Telefone</Field.Label><Input {...register('phone')} /></Field.Root>
                <Flex gap={3}>
                  <Field.Root flex={1}><Field.Label>Perfil</Field.Label>
                    <Controller control={control} name="role" render={({ field }) => (
                      <Select.Root collection={roleCollection} value={[field.value]} onValueChange={({ value }) => field.onChange(value[0])}>
                        <Select.Trigger><Select.ValueText /></Select.Trigger>
                        <Select.Positioner><Select.Content>{roleCollection.items.map(i => <Select.Item key={i.value} item={i}>{i.label}</Select.Item>)}</Select.Content></Select.Positioner>
                      </Select.Root>
                    )} />
                  </Field.Root>
                  <Field.Root flex={1}><Field.Label>Status</Field.Label>
                    <Controller control={control} name="status" render={({ field }) => (
                      <Select.Root collection={statusCollection} value={[field.value]} onValueChange={({ value }) => field.onChange(value[0])}>
                        <Select.Trigger><Select.ValueText /></Select.Trigger>
                        <Select.Positioner><Select.Content>{statusCollection.items.map(i => <Select.Item key={i.value} item={i}>{i.label}</Select.Item>)}</Select.Content></Select.Positioner>
                      </Select.Root>
                    )} />
                  </Field.Root>
                </Flex>
              </Flex>
            </form>
          </Dialog.Body>
          <Dialog.Footer gap={3}><Button variant="ghost" onClick={() => { setModalOpen(false); setEditing(null) }}>Cancelar</Button><Button form="user-form" type="submit" colorPalette="blue" loading={save.isPending}>Salvar</Button></Dialog.Footer>
        </Dialog.Content></Dialog.Positioner>
      </Dialog.Root>

      <ConfirmDialog open={!!deactivateTarget} title="Desativar Usuário" description={`Deseja desativar "${deactivateTarget?.name}"?`} confirmLabel="Desativar" isLoading={deactivate.isPending} onConfirm={() => deactivateTarget && deactivate.mutate(deactivateTarget.id)} onClose={() => setDeactivateTarget(null)} />
    </>
  )
}
