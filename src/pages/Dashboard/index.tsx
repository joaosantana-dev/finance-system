import { Box, Grid, Flex, Text, Skeleton } from '@chakra-ui/react'
import { TrendingUp, TrendingDown, AlertCircle, Clock, Wallet, ArrowUpRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { dashboardApi } from '@/services/finance'
import { formatCurrency, formatDate } from '@/utils/format'
import { StatusBadge } from '@/components/ui/StatusBadge'

function StatCard({ label, value, sub, positive, icon: Icon, gradient, iconColor, isLoading }: {
  label: string
  value: string
  sub?: string
  positive?: boolean
  icon: React.ElementType
  gradient: string
  iconColor: string
  isLoading?: boolean
}) {
  return (
    <Box
      bg="card.bg"
      borderRadius="2xl"
      p={5}
      boxShadow="0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)"
      border="1px solid"
      borderColor="card.border"
      _hover={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)', transform: 'translateY(-1px)' }}
      transition="all 0.2s ease"
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top={0}
        right={0}
        w="100px"
        h="100px"
        bg={gradient}
        opacity={0.06}
        borderRadius="full"
        transform="translate(30%, -30%)"
        pointerEvents="none"
      />
      <Flex justify="space-between" align="flex-start">
        <Box flex={1}>
          <Text fontSize="11px" color="gray.500" fontWeight="600" textTransform="uppercase" letterSpacing="wider" mb={2.5}>
            {label}
          </Text>
          {isLoading
            ? <Skeleton h="28px" w="130px" borderRadius="lg" mb={1} />
            : <Text fontSize="2xl" fontWeight="800" lineHeight="1.1" letterSpacing="-0.03em">{value}</Text>
          }
          {sub && (
            <Flex align="center" gap={1} mt={1.5}>
              {positive !== undefined && (
                positive
                  ? <TrendingUp size={11} color="#22c55e" />
                  : <TrendingDown size={11} color="#ef4444" />
              )}
              <Text fontSize="11px" color={positive ? 'green.500' : positive === false ? 'red.500' : 'gray.400'} fontWeight="500">
                {sub}
              </Text>
            </Flex>
          )}
        </Box>
        <Flex
          w="42px"
          h="42px"
          borderRadius="xl"
          align="center"
          justify="center"
          flexShrink={0}
          bg={gradient}
        >
          <Icon size={19} color={iconColor} />
        </Flex>
      </Flex>
    </Box>
  )
}

const CURRENCY_FORMATTER = (v: number) => `R$ ${(v / 1000).toFixed(0)}k`

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <Box bg="white" _dark={{ bg: 'gray.800' }} border="1px solid" borderColor="gray.200" borderRadius="xl" p={3} boxShadow="lg" fontSize="sm">
      <Text fontWeight="600" mb={1} color="gray.600" fontSize="xs">{label}</Text>
      {payload.map((p) => (
        <Text key={p.name} fontWeight="600" color={p.name === 'Receitas' ? 'green.500' : 'red.500'}>
          {p.name}: {formatCurrency(p.value)}
        </Text>
      ))}
    </Box>
  )
}

export function DashboardPage() {
  const { data: summary, isLoading: loadingSummary } = useQuery({ queryKey: ['dashboard-summary'], queryFn: dashboardApi.getSummary })
  const { data: monthlyFlow = [], isLoading: loadingFlow } = useQuery({ queryKey: ['dashboard-monthly-flow'], queryFn: dashboardApi.getMonthlyFlow })
  const { data: expensesByCategory = [], isLoading: loadingCat } = useQuery({ queryKey: ['dashboard-expenses-cat'], queryFn: dashboardApi.getExpensesByCategory })
  const { data: recentTx = [], isLoading: loadingTx } = useQuery({ queryKey: ['dashboard-recent-tx'], queryFn: dashboardApi.getRecentTransactions })

  const cards = [
    { label: 'Saldo Atual',       value: formatCurrency(summary?.currentBalance ?? 0),   icon: Wallet,        gradient: '#eff6ff', iconColor: '#3b82f6' },
    { label: 'Total Receitas',    value: formatCurrency(summary?.totalRevenue ?? 0),      positive: true,  sub: 'acumulado', icon: TrendingUp,   gradient: '#f0fdf4', iconColor: '#22c55e' },
    { label: 'Total Despesas',    value: formatCurrency(summary?.totalExpenses ?? 0),     positive: false, sub: 'acumulado', icon: TrendingDown, gradient: '#fef2f2', iconColor: '#ef4444' },
    { label: 'Contas Vencidas',   value: formatCurrency(summary?.overduePayable ?? 0),   sub: 'a pagar em atraso',   icon: AlertCircle, gradient: '#fff7ed', iconColor: '#f97316' },
    { label: 'Vence em 7 dias',   value: formatCurrency(summary?.dueSoonPayable ?? 0),   sub: 'atenção necessária',  icon: Clock,       gradient: '#faf5ff', iconColor: '#a855f7' },
  ]

  return (
    <Box>
      <Box mb={7}>
        <Text fontSize="2xl" fontWeight="800" letterSpacing="-0.03em" color="gray.900" _dark={{ color: 'white' }}>
          Dashboard
        </Text>
        <Text fontSize="sm" color="gray.500" mt={0.5}>
          Visão geral das finanças corporativas
        </Text>
      </Box>

      <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(5, 1fr)' }} gap={4} mb={5}>
        {cards.map((c) => <StatCard key={c.label} {...c} isLoading={loadingSummary} />)}
      </Grid>

      <Grid templateColumns={{ base: '1fr', lg: '1.5fr 1fr' }} gap={4} mb={4}>
        <Box
          bg="card.bg"
          borderRadius="2xl"
          p={5}
          boxShadow="0 1px 3px rgba(0,0,0,0.06)"
          border="1px solid"
          borderColor="card.border"
        >
          <Flex justify="space-between" align="center" mb={5}>
            <Box>
              <Text fontWeight="700" letterSpacing="-0.02em">Receitas × Despesas</Text>
              <Text fontSize="xs" color="gray.500">Últimos 6 meses</Text>
            </Box>
          </Flex>
          {loadingFlow ? <Skeleton h="240px" borderRadius="xl" /> : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyFlow} barGap={4} barCategoryGap="30%">
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={CURRENCY_FORMATTER} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={55} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                <Bar dataKey="receitas" name="Receitas" fill="#22c55e" radius={[6, 6, 0, 0]} />
                <Bar dataKey="despesas" name="Despesas" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Box>

        <Box
          bg="card.bg"
          borderRadius="2xl"
          p={5}
          boxShadow="0 1px 3px rgba(0,0,0,0.06)"
          border="1px solid"
          borderColor="card.border"
        >
          <Box mb={5}>
            <Text fontWeight="700" letterSpacing="-0.02em">Despesas por Categoria</Text>
            <Text fontSize="xs" color="gray.500">Distribuição do período</Text>
          </Box>
          {loadingCat ? <Skeleton h="240px" borderRadius="xl" /> : (expensesByCategory as unknown[]).length === 0 ? (
            <Flex align="center" justify="center" h="240px" direction="column" gap={2} color="gray.400">
              <Text fontSize="sm">Nenhum dado disponível</Text>
            </Flex>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  dataKey="total"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  outerRadius={82}
                  innerRadius={46}
                  paddingAngle={2}
                >
                  {(expensesByCategory as { color: string }[]).map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Box>
      </Grid>

      <Box
        bg="card.bg"
        borderRadius="2xl"
        boxShadow="0 1px 3px rgba(0,0,0,0.06)"
        border="1px solid"
        borderColor="card.border"
        overflow="hidden"
      >
        <Flex justify="space-between" align="center" px={5} py={4} borderBottom="1px solid" borderColor="card.border">
          <Box>
            <Text fontWeight="700" letterSpacing="-0.02em">Últimas Movimentações</Text>
            <Text fontSize="xs" color="gray.500">Transações mais recentes</Text>
          </Box>
          <Flex align="center" gap={1} color="gray.400" fontSize="xs" fontWeight="500">
            <Text>Ver todas</Text>
            <ArrowUpRight size={13} />
          </Flex>
        </Flex>

        {loadingTx ? (
          <Flex direction="column" gap={0} px={5} py={3}>
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} h="52px" borderRadius="lg" mb={2} />)}
          </Flex>
        ) : (recentTx as unknown[]).length === 0 ? (
          <Flex align="center" justify="center" py={10} color="gray.400">
            <Text fontSize="sm">Nenhuma movimentação recente</Text>
          </Flex>
        ) : (
          <Box>
            {(recentTx as Record<string, unknown>[]).map((tx, i) => (
              <Flex
                key={i}
                align="center"
                justify="space-between"
                px={5}
                py={3.5}
                borderBottom="1px solid"
                borderColor="card.border"
                _last={{ borderBottom: 'none' }}
                _hover={{ bg: 'table.row.hover' }}
                transition="background 0.1s"
              >
                <Flex align="center" gap={3}>
                  <Flex
                    w="36px"
                    h="36px"
                    borderRadius="lg"
                    align="center"
                    justify="center"
                    bg={tx.type === 'receita' ? '#f0fdf4' : '#fef2f2'}
                    flexShrink={0}
                  >
                    {tx.type === 'receita'
                      ? <TrendingUp size={15} color="#22c55e" />
                      : <TrendingDown size={15} color="#ef4444" />
                    }
                  </Flex>
                  <Box>
                    <Text fontSize="sm" fontWeight="600" letterSpacing="-0.01em" lineHeight="1.3">
                      {String(tx.description)}
                    </Text>
                    <Text fontSize="11px" color="gray.500" lineHeight="1.3">
                      {String(tx.entity_name || '—')} · {formatDate(String(tx.due_date))}
                    </Text>
                  </Box>
                </Flex>
                <Flex align="center" gap={3}>
                  <StatusBadge status={String(tx.status)} />
                  <Text
                    fontSize="sm"
                    fontWeight="700"
                    letterSpacing="-0.02em"
                    color={tx.type === 'receita' ? 'green.500' : 'red.500'}
                    minW="90px"
                    textAlign="right"
                  >
                    {tx.type === 'receita' ? '+' : '-'}{formatCurrency(Number(tx.amount))}
                  </Text>
                </Flex>
              </Flex>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  )
}
