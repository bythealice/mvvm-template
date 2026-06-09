'use client'

import { useOrdersViewModel } from '../hooks/useOrdersViewModel'
import { OrdersTable } from './OrdersTable'
import { OrderActionModal } from './OrderActionModal'
import { Skeleton } from '@/shared/ui/skeleton'

export function OrdersView() {
  const vm = useOrdersViewModel()

  return (
    <main className="min-h-screen bg-surface p-6 md:p-10">
      <header className="mb-8">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-text-primary">Pedidos</h1>
          {vm.pendingCount > 0 && (
            <span className="rounded-full bg-brand-green/20 px-2.5 py-0.5 text-xs font-semibold text-brand-dark">
              {vm.pendingCount} pendente{vm.pendingCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-text-muted">
          Gerencie aprovações de pedidos
        </p>
      </header>

      {vm.isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      )}

      {vm.isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Erro ao carregar pedidos. Tente novamente.
        </div>
      )}

      {!vm.isLoading && !vm.isError && (
        <OrdersTable
          orders={vm.orders}
          canApprove={vm.canApprove}
          onApprove={(order) => vm.openModal(order, 'approve')}
          onReject={(order) => vm.openModal(order, 'reject')}
        />
      )}

      <OrderActionModal
        open={vm.modalOpen}
        action={vm.modalAction}
        order={vm.selectedOrder}
        form={vm.form}
        onSubmit={vm.onSubmit}
        onClose={vm.closeModal}
        isMutating={vm.isMutating}
        error={vm.mutationError}
      />
    </main>
  )
}
