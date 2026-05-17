import { Box, Grid, Flex, Text, Skeleton } from '@chakra-ui/react'
import { TrendingUp, TrendingDown, AlertCircle, Clock, Wallet, ArrowUpRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { dashboardApi } from '@/services/finance'
import { formatCurrency, formatDate } from '@/utils/format'
import { StatusBadge } from '@/components/ui/StatusBadge'

function StatCard({ label, value, sub, positive, icon: Icon, iconBg, iconColor, isLoading }: {
  label: string; value: string; sub?: string; positive?: boolean; icon: React.ElementType; iconBg: string; iconColor: string; isLoading?: boolean
}) {
  return (
    <Box bg="card.bg" borderRadius="xl" p={5} boxShadow="sm" border="1px solid" borderColor="gray.100" _dark={{ borderColor: 'whiteAlpha.100' }}>
      <Flex justify="space-between" align="flex-start">
        <Box flex={1}>
          <Text fontSize="xs" color="gray.500" fontWeight="500" textTransform="uppercase" letterSpacing="wider" mb={2}>{label}</Text>
          {isLoading ? <Skeleton h="28px" w="140px" borderRadius="md" mb={1} /> : <Text fontSize="2xl" fontWeight="700" lineHeight="1.2">{value}</Text>}
          {sub && (
            <Flex align="center" gap={1} mt={1}>
              {positive !== undefined && (positive ? <TrendingUp size={12} color="#22c55e" /> : <TrendingDown size={12} color="#ef4444" />)}
              <Text fontSize="xs" color={positive ? 'green.500' : positive === false ? 'red.500' : 'gray.400'}>{sub}</Text>
            </Flex>
          )}
        </Box>
        <Flex w={10} h={10} borderRadius="lg" align="center" justify="center" flexShrink={0} style={{ background: iconBg }}>
          <Icon size={20} color={iconColor} />
        </Flex>
      </Flex>
    </Box>
  )
}

const CURRENCY_FORMATTER = (v: number) => `R$ ${(v / 1000).toFixed(0)}k`

export function DashboardPage() {
  const { data: summary, isLoading: loadingSummary } = useQuery({ queryKey: ['dashboard-summary'], queryFn: dashboardApi.getSummary })
  const { data: monthlyFlow = [], isLoading: loadingFlow } = useQuery({ queryKey: ['dashboard-monthly-flow'], queryFn: dashboardApi.getMonthlyFlow })
  const { data: expensesByCategory = [], isLoading: loadingCat } = useQuery({ queryKey: ['dashboard-expenses-cat'], queryFn: dashboardApi.getExpensesByCategory })
  const { data: recentTx = [], isLoading: loadingTx } = useQuery({ queryKey: ['dashboard-recent-tx'], queryFn: dashboardApi.getRecentTransactions })

  const cards = [
    { label: 'Saldo Atual', value: formatCurrency(summary?.currentBalance ?? 0), icon: Wallet, iconBg: '#eff6ff', iconColor: '#3b82f6' },
    { label: 'Total Receitas', value: formatCurrency(summary?.totalRevenue ?? 0), positive: true, sub: 'acumulado', icon: TrendingUp, iconBg: '#f0fdf4', iconColor: '#22c55e' },
    { label: 'Total Despesas', value: formatCurrency(summary?.totalExpenses ?? 0), positive: false, sub: 'acumulado', icon: TrendingDown, iconBg: '#fef2f2', iconColor: '#ef4444' },
    { label: 'Contas Vencidas', value: formatCurrency(summary?.overduePayable ?? 0), sub: 'a pagar em atraso', icon: AlertCircle, iconBg: '#fff7ed', iconColor: '#f97316' },
    { label: 'Vence em 7 dias', value: formatCurrency(summary?.dueSoonPayable ?? 0), sub: 'atenção necessária', icon: Clock, iconBg: '#faf5ff', iconColor: '#a855f7' },
  ]

  return (
    <Box>
      <Box mb={6}>
        <Text fontSize="2xl" fontWeight="700">Dashboard</Text>
        <Text fontSize="sm" color="gray.500">Visão geral das finanças corporativas</Text>
      </Box>

      <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(5, 1fr)' }} gap={4} mb={6}>
        {cards.map((c) => <StatCard key={c.label} {...c} isLoading={loadingSummary} />)}
      </Grid>

      <Grid templateColumns={{ base: '1fr', lg: '1.5fr 1fr' }} gap={4} mb={4}>
        <Box bg="card.bg" borderRadius="xl" p={5} boxShadow="sm" border="1px solid" borderColor="gray.100" _dark={{ borderColor: 'whiteAlpha.100' }}>
          <Text fontWeight="600" mb={4}>Receitas × Despesas (últimos 6 meses)</Text>
          {loadingFlow ? <Skeleton h="240px" borderRadius="lg" /> : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyFlow} barGap={4}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={CURRENCY_FORMATTER} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                <Bar dataKey="receitas" name="Receitas" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="despesas" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Box>

        <Box bg="card.bg" borderRadius="xl" p={5} boxShadow="sm" border="1px solid" borderColor="gray.100" _dark={{ borderColor: 'whiteAlpha.100' }}>
          <Text fontWeight="600" mb={4}>Despesas por Categoria</Text>
          {loadingCat ? <Skeleton h="240px" borderRadius="lg" /> : expensesByCategory.length === 0 ? (
            <Flex align="center" justify="center" h="240px" color="gray.400"><Text fontSize="sm">Sem dados</Text></Flex>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={expensesByCategory} dataKey="total" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                  {expensesByCategory.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Box>
      </Grid>

      <Box bg="card.bg" borderRadius="xl" p={5} boxShadow="sm" border="1px solid" borderColor="gray.100" _dark={{ borderColor: 'whiteAlpha.100' }}>
        <Flex justify="space-between" align="center" mb={4}>
          <Text fontWeight="600">Últimas Movimentações</Text>
          <ArrowUpRight size={16} color="#9ca3af" />
        </Flex>
        {loadingTx ? (
          <Flex direction="column" gap={3}>{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} h="48px" borderRadius="md" />)}</Flex>
        ) : (
          <Flex direction="column" gap={0}>
            {(recentTx as Record<string, unknown>[]).map((tx, i) => (
              <Flex key={i} align="center" justify="space-between" py={3} borderBottom="1px solid" borderColor="gray.50" _dark={{ borderColor: 'whiteAlpha.50' }} _last={{ borderBottom: 'none' }}>
                <Box>
                  <Text fontSize="sm" fontWeight="500">{String(tx.description)}</Text>
                  <Text fontSize="xs" color="gray.500">{String(tx.entity_name || '')} · {formatDate(String(tx.due_date))}</Text>
                </Box>
                <Flex align="center" gap={3}>
                  <StatusBadge status={String(tx.status)} />
                  <Text fontSize="sm" fontWeight="600" color={tx.type === 'receita' ? 'green.500' : 'red.500'}>
                    {tx.type === 'receita' ? '+' : '-'}{formatCurrency(Number(tx.amount))}
                  </Text>
                </Flex>
              </Flex>
            ))}
          </Flex>
        )}
      </Box>
    </Box>
  )
}
