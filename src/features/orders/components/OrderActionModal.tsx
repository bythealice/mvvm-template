import type React from 'react'
import { Button } from '@/shared/ui/button'
import type { UseFormReturn } from 'react-hook-form'
import type { ApproveOrderInput, Order } from '../types/order.types'

interface OrderActionModalProps {
  open:        boolean
  action:      'approve' | 'reject' | null
  order:       Order | null
  form:        UseFormReturn<ApproveOrderInput>
  onSubmit:    React.FormEventHandler<HTMLFormElement>
  onClose:     () => void
  isMutating:  boolean
  error:       Error | null
}

export function OrderActionModal({
  open, action, order, form, onSubmit, onClose, isMutating, error
}: OrderActionModalProps) {
  if (!open || !order || !action) return null

  const isApprove = action === 'approve'
  const title = isApprove ? `Aprovar ${order.code}` : `Rejeitar ${order.code}`
  const { register, formState: { errors } } = form

  return (
    // Backdrop
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/60 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className={`rounded-t-xl px-6 py-4 ${isApprove ? 'bg-brand-green/10' : 'bg-red-50'}`}>
          <h2 id="modal-title" className="text-base font-semibold text-text-primary">
            {title}
          </h2>
          <p className="mt-0.5 text-sm text-text-muted">
            Cliente: <span className="font-medium text-text-primary">{order.customer}</span>
            {' · '}
            {order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>

        {/* Body */}
        <form onSubmit={onSubmit} className="px-6 py-5 space-y-4">
          {/* Campo oculto com o id */}
          <input type="hidden" {...register('orderId')} />

          <div>
            <label
              htmlFor="comment"
              className="mb-1.5 block text-sm font-medium text-text-primary"
            >
              Comentário <span className="text-red-500">*</span>
            </label>
            <textarea
              id="comment"
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
              placeholder="Descreva o motivo da decisão..."
              {...register('comment')}
            />
            {errors.comment && (
              <p className="mt-1 text-xs text-red-500">{errors.comment.message}</p>
            )}
          </div>

          {error && (
            <p className="text-xs text-red-500">
              Erro: {error.message}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isMutating}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant={isApprove ? 'primary' : 'danger'}
              disabled={isMutating}
            >
              {isMutating ? 'Salvando...' : isApprove ? 'Confirmar aprovação' : 'Confirmar rejeição'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
