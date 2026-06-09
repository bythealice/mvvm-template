import type React from 'react'
import type { UseFormReturn } from 'react-hook-form'
import type { ApproveOrderInput, Order } from '../types/order.types'
import { CheckCircle2, XCircle, X, AlertCircle } from 'lucide-react'

interface OrderActionModalProps {
  open: boolean
  action: 'approve' | 'reject' | null
  order: Order | null
  form: UseFormReturn<ApproveOrderInput>
  onSubmit: React.FormEventHandler<HTMLFormElement>
  onClose: () => void
  isMutating: boolean
  error: Error | null
}

export function OrderActionModal({
  open,
  action,
  order,
  form,
  onSubmit,
  onClose,
  isMutating,
  error,
}: OrderActionModalProps) {
  if (!open || !order || !action) return null

  const isApprove = action === 'approve'
  const {
    register,
    formState: { errors },
  } = form

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0e0e0e] shadow-2xl">
        {/* Header */}
        <div className="relative px-8 pb-6 pt-8">
          {/* Icon */}
          <div
            className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${
              isApprove ? 'bg-brand-green/15' : 'bg-red-400/15'
            }`}
          >
            {isApprove ? (
              <CheckCircle2 className="h-6 w-6 text-brand-green" />
            ) : (
              <XCircle className="h-6 w-6 text-red-400" />
            )}
          </div>

          {/* Title */}
          <h2 id="modal-title" className="mb-1 text-xl font-black text-white">
            {isApprove ? 'Aprovar pedido' : 'Rejeitar pedido'}
          </h2>

          {/* Order info */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/35">
            <span className="font-mono font-bold text-brand-green">{order.code}</span>
            <span className="text-white/15">·</span>
            <span>{order.customer}</span>
            <span className="text-white/15">·</span>
            <span className="font-semibold text-white/55">
              {order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute right-6 top-6 flex h-8 w-8 items-center justify-center rounded-xl text-white/25 transition-colors hover:bg-white/[0.08] hover:text-white/70"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Divider */}
          <div
            className="absolute bottom-0 left-0 right-0 h-px"
            style={{
              background: isApprove
                ? 'linear-gradient(90deg, transparent, rgba(68,220,152,0.15), transparent)'
                : 'linear-gradient(90deg, transparent, rgba(248,113,113,0.15), transparent)',
            }}
          />
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="px-8 py-7 space-y-5">
          <input type="hidden" {...register('orderId')} />

          <div>
            <label htmlFor="comment" className="mb-2.5 block text-sm font-semibold text-white/60">
              Comentário <span className={isApprove ? 'text-brand-green' : 'text-red-400'}>*</span>
            </label>
            <textarea
              id="comment"
              rows={4}
              className="w-full resize-none rounded-2xl border border-white/[0.07] bg-white/[0.04] px-4 py-3.5 text-sm text-white/90 placeholder:text-white/20 outline-none transition-all duration-200 focus:border-brand-green/30 focus:bg-white/[0.06] focus:ring-2 focus:ring-brand-green/8"
              placeholder={
                isApprove ? 'Descreva o motivo da aprovação...' : 'Descreva o motivo da rejeição...'
              }
              {...register('comment')}
            />
            {errors.comment && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {errors.comment.message}
              </p>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2.5 rounded-2xl border border-red-400/15 bg-red-400/8 px-4 py-3 text-xs text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error.message}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isMutating}
              className="flex-1 rounded-2xl border border-white/[0.07] bg-transparent py-3.5 text-sm font-semibold text-white/40 transition-all hover:bg-white/[0.05] hover:text-white/70 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isMutating}
              className={`flex-1 rounded-2xl py-3.5 text-sm font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${
                isApprove ? 'bg-brand-green text-brand-dark' : 'bg-red-400 text-white'
              }`}
              style={
                !isMutating
                  ? {
                      boxShadow: isApprove
                        ? '0 0 30px rgba(68,220,152,0.25), 0 8px 20px rgba(68,220,152,0.1)'
                        : '0 0 30px rgba(248,113,113,0.25), 0 8px 20px rgba(248,113,113,0.1)',
                    }
                  : undefined
              }
            >
              {isMutating
                ? 'Processando...'
                : isApprove
                  ? 'Confirmar aprovação'
                  : 'Confirmar rejeição'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
