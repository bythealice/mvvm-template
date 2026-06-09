import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import type { Order, OrderStatus } from '../types/order.types'

interface OrdersTableProps {
  orders:     Order[]
  canApprove: boolean
  onApprove:  (order: Order) => void
  onReject:   (order: Order) => void
}

const statusLabel: Record<OrderStatus, string> = {
  pending:  'Pendente',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
}

export function OrdersTable({ orders, canApprove, onApprove, onReject }: OrdersTableProps) {
  if (orders.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-brand-green/30 p-12 text-center">
        <p className="text-sm text-text-muted">Nenhum pedido encontrado.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-surface-muted">
          <tr>
            {['Código', 'Cliente', 'Total', 'Status', ''].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {orders.map((order) => (
            <tr key={order.id} className="bg-white hover:bg-surface-muted/50 transition-colors">
              <td className="px-4 py-3 font-mono text-brand-dark font-semibold">
                {order.code}
              </td>
              <td className="px-4 py-3 text-text-primary">{order.customer}</td>
              <td className="px-4 py-3 text-text-primary">
                {order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </td>
              <td className="px-4 py-3">
                <Badge variant={order.status}>
                  {statusLabel[order.status]}
                </Badge>
              </td>
              <td className="px-4 py-3">
                {/* A View não decide quem pode aprovar — recebe canApprove do ViewModel */}
                {canApprove && order.status === 'pending' && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => onApprove(order)}
                      aria-label={`Aprovar pedido ${order.code}`}
                    >
                      Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-400 text-red-500 hover:bg-red-50"
                      onClick={() => onReject(order)}
                      aria-label={`Rejeitar pedido ${order.code}`}
                    >
                      Rejeitar
                    </Button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
