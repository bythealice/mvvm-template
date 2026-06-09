import { z } from 'zod'

// ─── Schemas ───────────────────────────────────────────────────
export const OrderStatusSchema = z.enum(['pending', 'approved', 'rejected'])

export const OrderSchema = z.object({
  id:        z.string().uuid(),
  code:      z.string(),
  customer:  z.string(),
  total:     z.number().positive(),
  status:    OrderStatusSchema,
  createdAt: z.string().datetime(),
})

export const OrderListSchema = z.array(OrderSchema)

export const ApproveOrderSchema = z.object({
  orderId: z.string().uuid(),
  comment: z.string().min(1, 'Comentário obrigatório').max(300),
})

// ─── Types ─────────────────────────────────────────────────────
export type OrderStatus = z.infer<typeof OrderStatusSchema>
export type Order       = z.infer<typeof OrderSchema>
export type ApproveOrderInput = z.infer<typeof ApproveOrderSchema>
