'use client'

import { useOrdersViewModel } from '../hooks/useOrdersViewModel'
import { OrdersTable } from './OrdersTable'
import { OrderActionModal } from './OrderActionModal'
import { Skeleton } from '@/shared/ui/skeleton'
import { Clock, CheckCircle2, XCircle, Package, TrendingUp } from 'lucide-react'
import type { ElementType } from 'react'

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: ElementType
  label: string
  value: number
  accent: string
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.025] px-6 py-5 backdrop-blur-sm">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-black text-white tabular-nums">{value}</p>
        <p className="text-xs font-medium text-white/35">{label}</p>
      </div>
    </div>
  )
}

export function OrdersView() {
  const vm = useOrdersViewModel()

  const approvedCount = vm.orders.filter((o) => o.status === 'approved').length
  const rejectedCount = vm.orders.filter((o) => o.status === 'rejected').length

  return (
    <div className="min-h-screen bg-brand-dark">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -top-64 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(ellipse, rgba(68,220,152,0.07) 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-12">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-green">
              Dashboard
            </p>
            <div className="flex items-center gap-3">
              <h1
                data-testid="orders-title"
                className="text-4xl font-black tracking-tight text-white"
              >
                Pedidos
              </h1>
              {vm.pendingCount > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-xs font-bold text-yellow-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-yellow-400" />
                  {vm.pendingCount} pendente{vm.pendingCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <p className="mt-1.5 text-sm text-white/30">Gerencie e aprove pedidos em tempo real</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-white/20">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Atualizado automaticamente</span>
          </div>
        </div>

        {/* Stats */}
        {!vm.isLoading && !vm.isError && (
          <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              icon={Package}
              label="Total"
              value={vm.orders.length}
              accent="bg-white/5 text-white/40"
            />
            <StatCard
              icon={Clock}
              label="Pendentes"
              value={vm.pendingCount}
              accent="bg-yellow-400/10 text-yellow-400"
            />
            <StatCard
              icon={CheckCircle2}
              label="Aprovados"
              value={approvedCount}
              accent="bg-brand-green/10 text-brand-green"
            />
            <StatCard
              icon={XCircle}
              label="Rejeitados"
              value={rejectedCount}
              accent="bg-red-400/10 text-red-400"
            />
          </div>
        )}

        {/* Loading */}
        {vm.isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-2xl bg-white/[0.04]" />
            ))}
          </div>
        )}

        {/* Error */}
        {vm.isError && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-400">
            <XCircle className="h-5 w-5 shrink-0" />
            Erro ao carregar pedidos. Verifique a conexão e tente novamente.
          </div>
        )}

        {/* Table */}
        {!vm.isLoading && !vm.isError && (
          <OrdersTable
            orders={vm.orders}
            canApprove={vm.canApprove}
            onApprove={(order) => vm.openModal(order, 'approve')}
            onReject={(order) => vm.openModal(order, 'reject')}
          />
        )}
      </div>

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
    </div>
  )
}
