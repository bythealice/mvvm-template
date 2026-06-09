'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useAuthStore } from '@/core/store/auth.store'
import { approveOrder, fetchOrders, rejectOrder } from '../services/orders.service'
import { ApproveOrderSchema, type ApproveOrderInput, type Order } from '../types/order.types'

const QUERY_KEY = ['orders'] as const

export function useOrdersViewModel() {
  const queryClient = useQueryClient()
  const role = useAuthStore((s) => s.role)

  // ─── Estado local de UI ──────────────────────────────────────
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalAction, setModalAction] = useState<'approve' | 'reject' | null>(null)

  // ─── Query ────────────────────────────────────────────────────
  const { data: orders = [], isLoading, isError } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchOrders,
    staleTime: 1000 * 30,
  })

  // ─── Form ─────────────────────────────────────────────────────
  const form = useForm<ApproveOrderInput>({
    resolver: zodResolver(ApproveOrderSchema),
    defaultValues: { orderId: '', comment: '' },
  })

  // ─── Mutations ────────────────────────────────────────────────
  const approveMutation = useMutation({
    mutationFn: approveOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      closeModal()
    },
  })

  const rejectMutation = useMutation({
    mutationFn: rejectOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      closeModal()
    },
  })

  // ─── Permissão ───────────────────────────────────────────────
  // A View não decide quem pode aprovar — o ViewModel resolve isso
  const canApprove = role === 'manager'

  // ─── Handlers ────────────────────────────────────────────────
  function openModal(order: Order, action: 'approve' | 'reject') {
    setSelectedOrder(order)
    setModalAction(action)
    form.setValue('orderId', order.id)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setSelectedOrder(null)
    setModalAction(null)
    form.reset()
  }

  function onSubmit(data: ApproveOrderInput) {
    if (modalAction === 'approve') approveMutation.mutate(data)
    else if (modalAction === 'reject') rejectMutation.mutate(data)
  }

  // ─── Derived ─────────────────────────────────────────────────
  const pendingCount  = orders.filter((o) => o.status === 'pending').length
  const isMutating    = approveMutation.isPending || rejectMutation.isPending
  const mutationError = approveMutation.error ?? rejectMutation.error

  return {
    // Data
    orders,
    isLoading,
    isError,
    pendingCount,
    // Selection
    selectedOrder,
    modalOpen,
    modalAction,
    // Form
    form,
    onSubmit: form.handleSubmit(onSubmit),
    // Handlers
    openModal,
    closeModal,
    // Mutations
    isMutating,
    mutationError,
    // Permissão
    canApprove,
  }
}
