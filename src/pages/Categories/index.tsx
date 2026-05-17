import { useState } from 'react'
import { Button, Flex, Box, Dialog, Field, Input, Select, createListCollection } from '@chakra-ui/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { categoriesApi } from '@/services/finance'
import { DataTable } from '@/components/ui/DataTable'
import { PageHeader } from '@/components/ui/PageHeader'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { Category } from '@/types/finance'

const schema = z.object({ name: z.string().min(2), type: z.enum(['receita', 'despesa', 'ambos']), color: z.string(), status: z.enum(['ativo', 'inativo']) })
type FormData = z.infer<typeof schema>
const typeCollection = createListCollection({ items: [{ label: 'Receita', value: 'receita' }, { label: 'Despesa', value: 'despesa' }, { label: 'Ambos', value: 'ambos' }] })
const statusCollection = createListCollection({ items: [{ label: 'Ativo', value: 'ativo' }, { label: 'Inativo', value: 'inativo' }] })
const typeLabel = { receita: 'Receita', despesa: 'Despesa', ambos: 'Ambos' }

export function CategoriesPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Category | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)

  const { data, isLoading } = useQuery({ queryKey: ['categories', page, search], queryFn: () => categoriesApi.list({ page, limit: 10, search }) })
  const save = useMutation({ mutationFn: (d: FormData) => editing ? categoriesApi.update(editing.id, d) : categoriesApi.create(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); setModalOpen(false); setEditing(null) } })
  const remove = useMutation({ mutationFn: (id: number) => categoriesApi.remove(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); setDeleteTarget(null) } })
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { type: 'despesa', color: '#3b82f6', status: 'ativo' } })

  const columns = [
    { key: 'name', label: 'Categoria', render: (r: Category) => <Flex align="center" gap={2}><Box w={3} h={3} borderRadius="full" style={{ background: r.color }} />{r.name}</Flex> },
    { key: 'type', label: 'Tipo', render: (r: Category) => typeLabel[r.type] },
    { key: 'status', label: 'Status', render: (r: Category) => <StatusBadge status={r.status} /> },
    { key: 'actions', label: '', width: '100px', render: (r: Category) => (<Flex gap={1}><Button size="xs" variant="ghost" onClick={() => { reset(r as FormData); setEditing(r); setModalOpen(true) }}><Pencil size={14} /></Button><Button size="xs" variant="ghost" colorPalette="red" onClick={() => setDeleteTarget(r)}><Trash2 size={14} /></Button></Flex>) },
  ]

  return (
    <>
      <PageHeader title="Categorias" description="Classifique receitas e despesas por categoria" actions={<Button colorPalette="blue" size="sm" onClick={() => { reset({ type: 'despesa', color: '#3b82f6', status: 'ativo' }); setEditing(null); setModalOpen(true) }}><Plus size={16} />Nova Categoria</Button>} />
      <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading} pagination={data?.pagination} onPageChange={setPage} search={search} onSearch={(v) => { setSearch(v); setPage(1) }} />

      <Dialog.Root open={modalOpen} onOpenChange={({ open: o }) => { if (!o) { setModalOpen(false); setEditing(null) } }}>
        <Dialog.Backdrop /><Dialog.Positioner><Dialog.Content maxW="440px">
          <Dialog.Header><Dialog.Title>{editing ? 'Editar' : 'Nova'} Categoria</Dialog.Title></Dialog.Header>
          <Dialog.Body>
            <form id="cat-form" onSubmit={handleSubmit((d) => save.mutate(d))}>
              <Flex direction="column" gap={4}>
                <Field.Root invalid={!!errors.name}><Field.Label>Nome *</Field.Label><Input {...register('name')} /><Field.ErrorText>{errors.name?.message}</Field.ErrorText></Field.Root>
                <Field.Root><Field.Label>Tipo</Field.Label>
                  <Controller control={control} name="type" render={({ field }) => (
                    <Select.Root collection={typeCollection} value={[field.value]} onValueChange={({ value }) => field.onChange(value[0])}>
                      <Select.Trigger><Select.ValueText /></Select.Trigger>
                      <Select.Positioner><Select.Content>{typeCollection.items.map(i => <Select.Item key={i.value} item={i}>{i.label}</Select.Item>)}</Select.Content></Select.Positioner>
                    </Select.Root>
                  )} />
                </Field.Root>
                <Field.Root><Field.Label>Cor</Field.Label><Input type="color" {...register('color')} h="40px" /></Field.Root>
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
          <Dialog.Footer gap={3}><Button variant="ghost" onClick={() => { setModalOpen(false); setEditing(null) }}>Cancelar</Button><Button form="cat-form" type="submit" colorPalette="blue" loading={save.isPending}>Salvar</Button></Dialog.Footer>
        </Dialog.Content></Dialog.Positioner>
      </Dialog.Root>
      <ConfirmDialog open={!!deleteTarget} title="Excluir Categoria" description={`Deseja excluir "${deleteTarget?.name}"?`} isLoading={remove.isPending} onConfirm={() => deleteTarget && remove.mutate(deleteTarget.id)} onClose={() => setDeleteTarget(null)} />
    </>
  )
}
