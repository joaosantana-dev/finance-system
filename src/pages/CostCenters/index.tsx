import { useState } from 'react'
import { Button, Flex, Dialog, Field, Input, Select, createListCollection } from '@chakra-ui/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { costCentersApi } from '@/services/finance'
import { DataTable } from '@/components/ui/DataTable'
import { PageHeader } from '@/components/ui/PageHeader'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { CostCenter } from '@/types/finance'

const schema = z.object({ name: z.string().min(2), code: z.string().optional(), description: z.string().optional(), status: z.enum(['ativo', 'inativo']) })
type FormData = z.infer<typeof schema>
const statusCollection = createListCollection({ items: [{ label: 'Ativo', value: 'ativo' }, { label: 'Inativo', value: 'inativo' }] })

export function CostCentersPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<CostCenter | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<CostCenter | null>(null)

  const { data, isLoading } = useQuery({ queryKey: ['cost-centers', page, search], queryFn: () => costCentersApi.list({ page, limit: 10, search }) })
  const save = useMutation({ mutationFn: (d: FormData) => editing ? costCentersApi.update(editing.id, d) : costCentersApi.create(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['cost-centers'] }); setModalOpen(false); setEditing(null) } })
  const remove = useMutation({ mutationFn: (id: number) => costCentersApi.remove(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['cost-centers'] }); setDeleteTarget(null) } })
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { status: 'ativo' } })

  const columns = [
    { key: 'name', label: 'Nome' },
    { key: 'code', label: 'Código', render: (r: CostCenter) => r.code || '-' },
    { key: 'description', label: 'Descrição', render: (r: CostCenter) => r.description || '-' },
    { key: 'status', label: 'Status', render: (r: CostCenter) => <StatusBadge status={r.status} /> },
    { key: 'actions', label: '', width: '100px', render: (r: CostCenter) => (<Flex gap={1}><Button size="xs" variant="ghost" onClick={() => { reset(r as FormData); setEditing(r); setModalOpen(true) }}><Pencil size={14} /></Button><Button size="xs" variant="ghost" colorPalette="red" onClick={() => setDeleteTarget(r)}><Trash2 size={14} /></Button></Flex>) },
  ]

  return (
    <>
      <PageHeader title="Centros de Custo" description="Organize as despesas por centros de custo" actions={<Button colorPalette="blue" size="sm" onClick={() => { reset({ status: 'ativo' }); setEditing(null); setModalOpen(true) }}><Plus size={16} />Novo Centro</Button>} />
      <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading} pagination={data?.pagination} onPageChange={setPage} search={search} onSearch={(v) => { setSearch(v); setPage(1) }} />

      <Dialog.Root open={modalOpen} onOpenChange={({ open: o }) => { if (!o) { setModalOpen(false); setEditing(null) } }}>
        <Dialog.Backdrop /><Dialog.Positioner><Dialog.Content maxW="440px">
          <Dialog.Header><Dialog.Title>{editing ? 'Editar' : 'Novo'} Centro de Custo</Dialog.Title></Dialog.Header>
          <Dialog.Body>
            <form id="cc-form" onSubmit={handleSubmit((d) => save.mutate(d))}>
              <Flex direction="column" gap={4}>
                <Field.Root invalid={!!errors.name}><Field.Label>Nome *</Field.Label><Input {...register('name')} /><Field.ErrorText>{errors.name?.message}</Field.ErrorText></Field.Root>
                <Field.Root><Field.Label>Código</Field.Label><Input {...register('code')} /></Field.Root>
                <Field.Root><Field.Label>Descrição</Field.Label><Input {...register('description')} /></Field.Root>
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
          <Dialog.Footer gap={3}><Button variant="ghost" onClick={() => { setModalOpen(false); setEditing(null) }}>Cancelar</Button><Button form="cc-form" type="submit" colorPalette="blue" loading={save.isPending}>Salvar</Button></Dialog.Footer>
        </Dialog.Content></Dialog.Positioner>
      </Dialog.Root>
      <ConfirmDialog open={!!deleteTarget} title="Excluir Centro de Custo" description={`Deseja excluir "${deleteTarget?.name}"?`} isLoading={remove.isPending} onConfirm={() => deleteTarget && remove.mutate(deleteTarget.id)} onClose={() => setDeleteTarget(null)} />
    </>
  )
}
