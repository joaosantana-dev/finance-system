import { useState } from 'react'
import { Box, Flex, Text, Select, createListCollection, Grid, Skeleton } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import { cashFlowApi } from '@/services/finance'
import { PageHeader } from '@/components/ui/PageHeader'
import { formatCurrency } from '@/utils/format'

const periodCollection = createListCollection({ items: [{ label: 'Mensal', value: 'monthly' }, { label: 'Anual', value: 'annual' }] })

const MONTHS = Array.from({ length: 12 }, (_, i) => ({ label: new Date(2000, i).toLocaleString('pt-BR', { month: 'long' }), value: String(i + 1) }))
const YEARS = Array.from({ length: 5 }, (_, i) => ({ label: String(new Date().getFullYear() - 2 + i), value: String(new Date().getFullYear() - 2 + i) }))

const monthCollection = createListCollection({ items: MONTHS })
const yearCollection = createListCollection({ items: YEARS })

const CURRENCY_FORMATTER = (v: number) => `R$ ${(v / 1000).toFixed(0)}k`

export function CashFlowPage() {
  const [period, setPeriod] = useState('monthly')
  const [year, setYear] = useState(String(new Date().getFullYear()))
  const [month, setMonth] = useState(String(new Date().getMonth() + 1))

  const { data, isLoading } = useQuery({
    queryKey: ['cash-flow', period, year, month],
    queryFn: () => cashFlowApi.get({ period, year: Number(year), month: Number(month) }),
  })

  const rows = (data as { data?: unknown[] })?.data ?? []

  const summary = (rows as Record<string, number>[]).reduce((acc, row) => ({
    previsto_entrada: acc.previsto_entrada + (row.previsto_entrada ?? 0),
    previsto_saida: acc.previsto_saida + (row.previsto_saida ?? 0),
    realizado_entrada: acc.realizado_entrada + (row.realizado_entrada ?? 0),
    realizado_saida: acc.realizado_saida + (row.realizado_saida ?? 0),
  }), { previsto_entrada: 0, previsto_saida: 0, realizado_entrada: 0, realizado_saida: 0 })

  return (
    <>
      <PageHeader
        title="Fluxo de Caixa"
        description="Acompanhe entradas e saídas de caixa"
        actions={
          <Flex gap={2}>
            <Select.Root collection={periodCollection} value={[period]} onValueChange={({ value }) => setPeriod(value[0])} size="sm" w="120px">
              <Select.Trigger><Select.ValueText /></Select.Trigger>
              <Select.Positioner><Select.Content>{periodCollection.items.map(i => <Select.Item key={i.value} item={i}>{i.label}</Select.Item>)}</Select.Content></Select.Positioner>
            </Select.Root>
            {period === 'monthly' && (
              <Select.Root collection={monthCollection} value={[month]} onValueChange={({ value }) => setMonth(value[0])} size="sm" w="140px">
                <Select.Trigger><Select.ValueText /></Select.Trigger>
                <Select.Positioner><Select.Content>{monthCollection.items.map(i => <Select.Item key={i.value} item={i}>{i.label}</Select.Item>)}</Select.Content></Select.Positioner>
              </Select.Root>
            )}
            <Select.Root collection={yearCollection} value={[year]} onValueChange={({ value }) => setYear(value[0])} size="sm" w="100px">
              <Select.Trigger><Select.ValueText /></Select.Trigger>
              <Select.Positioner><Select.Content>{yearCollection.items.map(i => <Select.Item key={i.value} item={i}>{i.label}</Select.Item>)}</Select.Content></Select.Positioner>
            </Select.Root>
          </Flex>
        }
      />

      <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={4} mb={5}>
        {[
          { label: 'Previsto Entradas',   value: summary.previsto_entrada,  color: 'green.500'  },
          { label: 'Previsto Saídas',     value: summary.previsto_saida,    color: 'red.500'    },
          { label: 'Realizado Entradas',  value: summary.realizado_entrada, color: 'teal.500'   },
          { label: 'Realizado Saídas',    value: summary.realizado_saida,   color: 'orange.500' },
        ].map(({ label, value, color }) => (
          <Box
            key={label}
            bg="card.bg"
            borderRadius="2xl"
            p={5}
            border="1px solid"
            borderColor="card.border"
            boxShadow="0 1px 3px rgba(0,0,0,0.05)"
          >
            <Flex align="center" gap={2} mb={2}>
              <Box w="8px" h="8px" borderRadius="full" bg={color} />
              <Text fontSize="11px" color="gray.500" fontWeight="600" textTransform="uppercase" letterSpacing="wider">{label}</Text>
            </Flex>
            {isLoading
              ? <Skeleton h="28px" w="120px" borderRadius="lg" />
              : <Text fontSize="xl" fontWeight="800" color={color} letterSpacing="-0.03em">{formatCurrency(value)}</Text>
            }
          </Box>
        ))}
      </Grid>

      <Box bg="card.bg" borderRadius="2xl" p={6} border="1px solid" borderColor="card.border" mb={4} boxShadow="0 1px 3px rgba(0,0,0,0.05)">
        <Flex justify="space-between" align="center" mb={5}>
          <Box>
            <Text fontWeight="700" letterSpacing="-0.02em">Fluxo de Caixa</Text>
            <Text fontSize="xs" color="gray.500">{period === 'monthly' ? `${MONTHS[Number(month) - 1]?.label} ${year}` : year}</Text>
          </Box>
        </Flex>
        {isLoading ? <Skeleton h="300px" borderRadius="lg" /> : rows.length === 0 ? (
          <Flex align="center" justify="center" h="300px" color="gray.400"><Text>Sem dados para o período selecionado</Text></Flex>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={rows as object[]}>
              <defs>
                <linearGradient id="gEntrada" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} /><stop offset="95%" stopColor="#22c55e" stopOpacity={0} /></linearGradient>
                <linearGradient id="gSaida" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey={period === 'monthly' ? 'date' : 'month'} tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={CURRENCY_FORMATTER} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Legend />
              <Area type="monotone" dataKey="previsto_entrada" name="Previsto Entrada" stroke="#22c55e" fill="url(#gEntrada)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="previsto_saida" name="Previsto Saída" stroke="#ef4444" fill="url(#gSaida)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="realizado_entrada" name="Real. Entrada" stroke="#14b8a6" fill="none" strokeWidth={2} strokeDasharray="4 2" dot={false} />
              <Area type="monotone" dataKey="realizado_saida" name="Real. Saída" stroke="#f97316" fill="none" strokeWidth={2} strokeDasharray="4 2" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Box>

      <Box
        bg="card.bg"
        borderRadius="2xl"
        border="1px solid"
        borderColor="card.border"
        overflow="hidden"
      >
        <Flex p={5} borderBottom="1px solid" borderColor="card.border" align="center" justify="space-between">
          <Box>
            <Text fontWeight="700" letterSpacing="-0.02em">Detalhamento</Text>
            <Text fontSize="xs" color="gray.500">Valores previstos e realizados por período</Text>
          </Box>
        </Flex>
        <Box overflowX="auto">
          <Box as="table" w="full" style={{ borderCollapse: 'collapse', fontSize: '13px' }}>
            <Box as="thead">
              <Box as="tr" bg="table.header">
                {['Data/Mês', 'Prev. Entrada', 'Prev. Saída', 'Prev. Saldo', 'Real. Entrada', 'Real. Saída', 'Real. Saldo'].map(h => (
                  <Box
                    key={h}
                    as="th"
                    px={4}
                    py={3}
                    textAlign="left"
                    fontSize="10px"
                    fontWeight="700"
                    color="gray.500"
                    textTransform="uppercase"
                    letterSpacing="wider"
                  >
                    {h}
                  </Box>
                ))}
              </Box>
            </Box>
            <Box as="tbody">
              {(rows as Record<string, unknown>[]).map((row, i) => (
                <Box
                  as="tr"
                  key={i}
                  borderTop="1px solid"
                  borderColor="table.border"
                  _hover={{ bg: 'table.row.hover' }}
                  transition="background 0.1s"
                >
                  <Box as="td" px={4} py={3} fontWeight="600" fontSize="sm">{String(row.date ?? row.month)}</Box>
                  <Box as="td" px={4} py={3} color="green.500" fontWeight="500" fontSize="sm">{formatCurrency(Number(row.previsto_entrada))}</Box>
                  <Box as="td" px={4} py={3} color="red.500" fontWeight="500" fontSize="sm">{formatCurrency(Number(row.previsto_saida))}</Box>
                  <Box as="td" px={4} py={3} fontWeight="700" fontSize="sm" color={Number(row.previsto_saldo) >= 0 ? 'green.500' : 'red.500'}>
                    {formatCurrency(Number(row.previsto_saldo))}
                  </Box>
                  <Box as="td" px={4} py={3} color="teal.500" fontWeight="500" fontSize="sm">{formatCurrency(Number(row.realizado_entrada))}</Box>
                  <Box as="td" px={4} py={3} color="orange.500" fontWeight="500" fontSize="sm">{formatCurrency(Number(row.realizado_saida))}</Box>
                  <Box as="td" px={4} py={3} fontWeight="700" fontSize="sm" color={Number(row.realizado_saldo) >= 0 ? 'green.500' : 'red.500'}>
                    {formatCurrency(Number(row.realizado_saldo))}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  )
}
