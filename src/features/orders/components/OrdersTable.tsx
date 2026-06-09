import type { Order, OrderStatus } from '../types/order.types'
import { CheckCircle2, XCircle, Clock, Inbox } from 'lucide-react'

interface OrdersTableProps {
  orders: Order[]
  canApprove: boolean
  onApprove: (order: Order) => void
  onReject: (order: Order) => void
}

const statusConfig: Record<
  OrderStatus,
  { label: string; icon: React.ElementType; badge: string; dot: string; pulse: boolean }
> = {
  pending: {
    label: 'Pendente',
    icon: Clock,
    badge: 'border-yellow-400/20 bg-yellow-400/10 text-yellow-400',
    dot: 'bg-yellow-400',
    pulse: true,
  },
  approved: {
    label: 'Aprovado',
    icon: CheckCircle2,
    badge: 'border-brand-green/20 bg-brand-green/10 text-brand-green',
    dot: 'bg-brand-green',
    pulse: false,
  },
  rejected: {
    label: 'Rejeitado',
    icon: XCircle,
    badge: 'border-red-400/20 bg-red-400/10 text-red-400',
    dot: 'bg-red-400',
    pulse: false,
  },
}

function CustomerAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-green/10 font-bold text-xs text-brand-green select-none">
      {initials}
    </div>
  )
}

export function OrdersTable({ orders, canApprove, onApprove, onReject }: OrdersTableProps) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/[0.07] py-24 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04]">
          <Inbox className="h-6 w-6 text-white/20" />
        </div>
        <p className="text-sm font-medium text-white/30">Nenhum pedido encontrado</p>
        <p className="mt-1 text-xs text-white/15">Os pedidos aparecerão aqui quando disponíveis</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/[0.06]">
      {/* Header */}
      <div className="grid grid-cols-[80px_1fr_140px_150px_1fr] gap-4 border-b border-white/[0.05] bg-white/[0.02] px-6 py-3.5">
        {['Código', 'Cliente', 'Total', 'Status', 'Ações'].map((h) => (
          <p key={h} className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/20">
            {h}
          </p>
        ))}
      </div>

      {/* Rows */}
      {orders.map((order, i) => {
        const { label, badge, dot, pulse } = statusConfig[order.status]
        const isLast = i === orders.length - 1

        return (
          <div
            key={order.id}
            data-testid="order-item"
            className={`grid grid-cols-[80px_1fr_140px_150px_1fr] items-center gap-4 px-6 py-4 transition-colors duration-150 hover:bg-white/[0.025] ${
              !isLast ? 'border-b border-white/[0.04]' : ''
            }`}
          >
            {/* Code */}
            <span className="font-mono text-sm font-bold text-brand-green">{order.code}</span>

            {/* Customer */}
            <div className="flex min-w-0 items-center gap-3">
              <CustomerAvatar name={order.customer} />
              <span className="truncate text-sm font-medium text-white/75">{order.customer}</span>
            </div>

            {/* Total */}
            <span className="text-sm font-semibold text-white">
              {order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>

            {/* Status */}
            <span
              className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${badge}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${dot} ${pulse ? 'animate-pulse' : ''}`} />
              {label}
            </span>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {canApprove && order.status === 'pending' && (
                <>
                  <button
                    data-testid="btn-approve"
                    onClick={() => onApprove(order)}
                    aria-label={`Aprovar pedido ${order.code}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-brand-green/20 bg-brand-green/10 px-4 py-2 text-xs font-bold text-brand-green transition-all duration-200 hover:border-brand-green/50 hover:bg-brand-green hover:text-brand-dark active:scale-95"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Aprovar
                  </button>

                  <button
                    data-testid="btn-reject"
                    onClick={() => onReject(order)}
                    aria-label={`Rejeitar pedido ${order.code}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-2 text-xs font-bold text-red-400 transition-all duration-200 hover:border-red-400/50 hover:bg-red-400 hover:text-white active:scale-95"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Rejeitar
                  </button>
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
