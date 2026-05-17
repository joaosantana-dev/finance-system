import { Badge } from '@chakra-ui/react'

const MAP: Record<string, { label: string; color: string }> = {
  pendente:   { label: 'Pendente',   color: 'yellow' },
  pago:       { label: 'Pago',       color: 'green'  },
  recebido:   { label: 'Recebido',   color: 'green'  },
  vencido:    { label: 'Vencido',    color: 'red'    },
  cancelado:  { label: 'Cancelado',  color: 'gray'   },
  negociado:  { label: 'Negociado',  color: 'blue'   },
  aprovado:   { label: 'Aprovado',   color: 'green'  },
  rejeitado:  { label: 'Rejeitado',  color: 'red'    },
  ativo:      { label: 'Ativo',      color: 'green'  },
  inativo:    { label: 'Inativo',    color: 'gray'   },
}

export function StatusBadge({ status }: { status: string }) {
  const s = MAP[status] ?? { label: status, color: 'gray' }
  return (
    <Badge colorPalette={s.color} variant="subtle" size="sm" borderRadius="full" px={2}>
      {s.label}
    </Badge>
  )
}
