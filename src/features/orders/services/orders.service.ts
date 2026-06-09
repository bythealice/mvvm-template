import { http } from '@/core/api/http'
import { OrderListSchema, OrderSchema, type ApproveOrderInput, type Order } from '../types/order.types'

// Simula dados enquanto não há backend real
const MOCK_ORDERS: Order[] = [
  { id: '11111111-0000-0000-0000-000000000001', code: 'ORD-001', customer: 'Empresa Alpha', total: 12500, status: 'pending',  createdAt: new Date().toISOString() },
  { id: '11111111-0000-0000-0000-000000000002', code: 'ORD-002', customer: 'Beta Ltda',     total:  8300, status: 'approved', createdAt: new Date().toISOString() },
  { id: '11111111-0000-0000-0000-000000000003', code: 'ORD-003', customer: 'Gama SA',        total:  3700, status: 'rejected', createdAt: new Date().toISOString() },
  { id: '11111111-0000-0000-0000-000000000004', code: 'ORD-004', customer: 'Delta Corp',     total: 21000, status: 'pending',  createdAt: new Date().toISOString() },
]

export async function fetchOrders(): Promise<Order[]> {
  // Em produção: remova o mock e use o http
  // const { data } = await http.get('/orders')
  // return OrderListSchema.parse(data)

  await new Promise((r) => setTimeout(r, 600)) // simula latência
  return OrderListSchema.parse(MOCK_ORDERS)
}

export async function approveOrder(input: ApproveOrderInput): Promise<Order> {
  // const { data } = await http.post(`/orders/${input.orderId}/approve`, { comment: input.comment })
  // return OrderSchema.parse(data)

  await new Promise((r) => setTimeout(r, 400))
  const order = MOCK_ORDERS.find((o) => o.id === input.orderId)
  if (!order) throw new Error('Pedido não encontrado')
  order.status = 'approved'
  return OrderSchema.parse(order)
}

export async function rejectOrder(input: ApproveOrderInput): Promise<Order> {
  // const { data } = await http.post(`/orders/${input.orderId}/reject`, { comment: input.comment })
  // return OrderSchema.parse(data)

  await new Promise((r) => setTimeout(r, 400))
  const order = MOCK_ORDERS.find((o) => o.id === input.orderId)
  if (!order) throw new Error('Pedido não encontrado')
  order.status = 'rejected'
  return OrderSchema.parse(order)
}
