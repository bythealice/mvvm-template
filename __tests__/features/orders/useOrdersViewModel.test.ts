import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { useOrdersViewModel } from '@/features/orders/hooks/useOrdersViewModel'
import * as ordersService from '@/features/orders/services/orders.service'
import { createWrapper } from '../../helpers/test-wrapper'
import type { Order } from '@/features/orders/types/order.types'

const mockOrders: Order[] = [
  {
    id: '11111111-0000-0000-0000-000000000001',
    code: 'ORD-001',
    customer: 'Empresa Alpha',
    total: 12500,
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: '11111111-0000-0000-0000-000000000002',
    code: 'ORD-002',
    customer: 'Beta Ltda',
    total: 8300,
    status: 'approved',
    createdAt: new Date().toISOString(),
  },
  {
    id: '11111111-0000-0000-0000-000000000003',
    code: 'ORD-003',
    customer: 'Gama SA',
    total: 3700,
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
]

vi.mock('@/features/orders/services/orders.service')

describe('useOrdersViewModel', () => {
  beforeEach(() => {
    vi.mocked(ordersService.fetchOrders).mockResolvedValue(mockOrders)
  })

  it('inicia em estado de loading', () => {
    const { result } = renderHook(() => useOrdersViewModel(), {
      wrapper: createWrapper(),
    })
    expect(result.current.isLoading).toBe(true)
  })

  it('carrega os pedidos após a query resolver', async () => {
    const { result } = renderHook(() => useOrdersViewModel(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.orders).toHaveLength(3)
    expect(result.current.orders[0].code).toBe('ORD-001')
  })

  it('calcula pendingCount com base nos pedidos com status pending', async () => {
    const { result } = renderHook(() => useOrdersViewModel(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.pendingCount).toBe(2)
  })

  it('expõe canApprove como booleano — true para role manager (default do store)', async () => {
    const { result } = renderHook(() => useOrdersViewModel(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(typeof result.current.canApprove).toBe('boolean')
    expect(result.current.canApprove).toBe(true)
  })

  it('expõe isError quando a query falha', async () => {
    vi.mocked(ordersService.fetchOrders).mockRejectedValue(new Error('Erro de rede'))

    const { result } = renderHook(() => useOrdersViewModel(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.isError).toBe(true)
  })

  it('openModal define selectedOrder, modalAction e abre o modal', async () => {
    const { result } = renderHook(() => useOrdersViewModel(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      result.current.openModal(mockOrders[0], 'approve')
    })

    expect(result.current.modalOpen).toBe(true)
    expect(result.current.selectedOrder?.id).toBe(mockOrders[0].id)
    expect(result.current.modalAction).toBe('approve')
  })

  it('closeModal limpa o estado do modal', async () => {
    const { result } = renderHook(() => useOrdersViewModel(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      result.current.openModal(mockOrders[0], 'reject')
    })

    act(() => {
      result.current.closeModal()
    })

    expect(result.current.modalOpen).toBe(false)
    expect(result.current.selectedOrder).toBeNull()
    expect(result.current.modalAction).toBeNull()
  })

  it('chama approveOrder após submeter form com dados válidos', async () => {
    vi.mocked(ordersService.approveOrder).mockResolvedValue({
      ...mockOrders[0],
      status: 'approved',
    })

    const { result } = renderHook(() => useOrdersViewModel(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      result.current.openModal(mockOrders[0], 'approve')
      // openModal já seta orderId via form.setValue — só falta o comment
      result.current.form.setValue('comment', 'Aprovado pelo gestor')
    })

    await act(async () => {
      await result.current.onSubmit()
    })

    await waitFor(() => {
      expect(ordersService.approveOrder).toHaveBeenCalledWith(
        expect.objectContaining({ orderId: mockOrders[0].id, comment: 'Aprovado pelo gestor' }),
        expect.anything()
      )
    })
  })

  it('chama rejectOrder após submeter form com action reject', async () => {
    vi.mocked(ordersService.rejectOrder).mockResolvedValue({
      ...mockOrders[0],
      status: 'rejected',
    })

    const { result } = renderHook(() => useOrdersViewModel(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      result.current.openModal(mockOrders[0], 'reject')
      result.current.form.setValue('comment', 'Fora do prazo')
    })

    await act(async () => {
      await result.current.onSubmit()
    })

    await waitFor(() => {
      expect(ordersService.rejectOrder).toHaveBeenCalledWith(
        expect.objectContaining({ orderId: mockOrders[0].id, comment: 'Fora do prazo' }),
        expect.anything()
      )
    })
  })
})
