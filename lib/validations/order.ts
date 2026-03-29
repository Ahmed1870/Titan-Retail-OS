import { z } from 'zod'

export const OrderSchema = z.object({
  tenant_id: z.string().uuid(),
  total_price: z.number().min(0),
  items: z.array(z.object({
    product_id: z.string().uuid(),
    quantity: z.number().min(1)
  }))
})
