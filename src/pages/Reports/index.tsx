import { useState } from 'react'
import { Box, Flex, Text, Button, Select, createListCollection, Grid, Table } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { reportsApi } from '@/services/finance'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { formatCurrency, formatDate } from '@/utils/format'
import { FileText, Download } from 'lucide-react'

const reportTypeCollection = createListCollection({ items: [{ label: 'Contas a Pagar', value: 'payable' }, { label: 'Contas a Receber', value: 'receivable' }, { label: 'Reembolsos', value: 'reimbursements' }] })

interface ReportTotals { total: number; paid?: number; received?: number; pending: number; overdue?: number }

export function ReportsPage() {
  const [reportType, setReportType] = useState('payable')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['reports', reportType, dateFrom, dateTo],
    queryFn: () => {
      const params = { date_from: dateFrom || undefined, date_to: dateTo || undefined }
      if (reportType === 'payable') return reportsApi.accountsPayable(params)
      if (reportType === 'receivable') return reportsApi.accountsReceivable(params)
      return reportsApi.reimbursements(params)
    },
    enabled: false,
  })

  const result = data as { data: Record<string, unknown>[]; totals: ReportTotals } | undefined

  const handleGenerate = () => refetch()

  return (
    <>
      <PageHeader title="Relatórios" description="Gere relatórios financeiros detalhados" />

      <Box bg="card.bg" borderRadius="xl" p={5} border="1px solid" borderColor="gray.100" _dark={{ borderColor: 'whiteAlpha.100' }} mb={6}>
        <Text fontWeight="600" mb={4}>Filtros</Text>
        <Flex gap={4} wrap="wrap" align="flex-end">
          <Box flex={1} minW="160px">
            <Text fontSize="sm" mb={1}>Tipo de relatório</Text>
            <Select.Root collection={reportTypeCollection} value={[reportType]} onValueChange={({ value }) => setReportType(value[0])}>
              <Select.Trigger><Select.ValueText /></Select.Trigger>
              <Select.Positioner><Select.Content>{reportTypeCollection.items.map(i => <Select.Item key={i.value} item={i}>{i.label}</Select.Item>)}</Select.Content></Select.Positioner>
            </Select.Root>
          </Box>
          <Box><Text fontSize="sm" mb={1}>Data inicial</Text><input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14 }} /></Box>
          <Box><Text fontSize="sm" mb={1}>Data final</Text><input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14 }} /></Box>
          <Button colorPalette="blue" onClick={handleGenerate} loading={isLoading}><FileText size={16} />Gerar Relatório</Button>
        </Flex>
      </Box>

      {result && (
        <>
          <Grid templateColumns={{ base: '1fr', sm: 'repeat(3, 1fr)' }} gap={4} mb={6}>
            {[
              { label: 'Total', value: result.totals.total },
              { label: result.totals.paid !== undefined ? 'Pago/Recebido' : 'Aprovado', value: result.totals.paid ?? result.totals.received ?? 0 },
              { label: 'Pendente', value: result.totals.pending },
            ].map(({ label, value }) => (
              <Box key={label} bg="card.bg" borderRadius="xl" p={4} border="1px solid" borderColor="gray.100" _dark={{ borderColor: 'whiteAlpha.100' }}>
                <Text fontSize="xs" color="gray.500" mb={1}>{label}</Text>
                <Text fontSize="xl" fontWeight="700">{formatCurrency(value)}</Text>
              </Box>
            ))}
          </Grid>

          <Box bg="card.bg" borderRadius="xl" border="1px solid" borderColor="gray.100" _dark={{ borderColor: 'whiteAlpha.100' }} overflow="hidden">
            <Flex p={4} justify="space-between" align="center" borderBottom="1px solid" borderColor="gray.100" _dark={{ borderColor: 'whiteAlpha.100' }}>
              <Text fontWeight="600">{result.data.length} registro(s)</Text>
              <Button size="sm" variant="outline" onClick={() => { const csv = result.data.map(r => Object.values(r).join(',')).join('\n'); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = `relatorio-${reportType}-${Date.now()}.csv`; a.click() }}><Download size={14} />Exportar CSV</Button>
            </Flex>
            <Box overflowX="auto">
              <Table.Root size="sm">
                <Table.Header>
                  <Table.Row bg="gray.50" _dark={{ bg: 'whiteAlpha.50' }}>
                    {['Descrição', 'Entidade', 'Categoria', 'Valor', 'Vencimento', 'Status'].map(h => (
                      <Table.ColumnHeader key={h} py={3} px={4} fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase">{h}</Table.ColumnHeader>
                    ))}
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {result.data.map((row, i) => (
                    <Table.Row key={i} _hover={{ bg: 'gray.50', _dark: { bg: 'whiteAlpha.50' } }}>
                      <Table.Cell py={3} px={4} fontSize="sm">{String(row.description)}</Table.Cell>
                      <Table.Cell py={3} px={4} fontSize="sm">{String(row.supplier_name ?? row.client_name ?? row.requester_name ?? '-')}</Table.Cell>
                      <Table.Cell py={3} px={4} fontSize="sm">{String(row.category_name ?? '-')}</Table.Cell>
                      <Table.Cell py={3} px={4} fontSize="sm" fontWeight="600">{formatCurrency(Number(row.amount))}</Table.Cell>
                      <Table.Cell py={3} px={4} fontSize="sm">{formatDate(String(row.due_date ?? row.receipt_date ?? ''))}</Table.Cell>
                      <Table.Cell py={3} px={4}><StatusBadge status={String(row.status)} /></Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Box>
          </Box>
        </>
      )}
    </>
  )
}
