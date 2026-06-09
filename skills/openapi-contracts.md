---
name: openapi-contracts
description: Gera ou sincroniza tipos TypeScript e services a partir do contrato OpenAPI do backend Django. Trigger em: atualiza os tipos do backend, o backend mudou a API, gera types do OpenAPI, sincroniza o contrato, o endpoint mudou.
---

# openapi-contracts

Lê o contrato OpenAPI gerado pelo `drf-spectacular` do backend Django e mantém os tipos TypeScript e services do front em sincronia. Quando o backend muda, o front sabe — antes de chegar em runtime.

## Como o fluxo funciona no projeto

O backend Django publica um `openapi.json` automaticamente. O front usa esse arquivo pra gerar tipos.

Geração automática (quando quiser rodar manualmente):
```bash
npx openapi-typescript http://localhost:8000/api/schema/ -o src/core/api/schema.d.ts
```

A skill não depende desse comando — ela lê o schema colado, a URL, ou o arquivo local, e gera os arquivos da feature diretamente.

## Lê antes de gerar

Quatro perguntas que precisam de resposta antes de produzir qualquer arquivo:

1. **Qual feature?** — precisa saber o recurso pra gerar os arquivos certos.
2. **Tem o schema?** — URL da API, JSON colado, ou arquivo local (`src/core/api/schema.d.ts`).
3. **Tem service existente?** — se sim, compara e aponta divergências em vez de sobrescrever cego.
4. **Backend usa snake_case ou camelCase?** — Django DRF usa snake_case por padrão.

Se não tiver nenhum desses, pede antes de prosseguir.

## O que faz quando invocado

Lê o contrato (path do endpoint, campos, tipos de cada campo, required vs optional), mapeia pro padrão do projeto e produz ou atualiza dois arquivos: `types/[nome].types.ts` com o schema derivado da spec, e `services/[nome].service.ts` com os paths e métodos exatos. Aponta divergências separadamente — campo que mudou de tipo, endpoint que sumiu, campo novo não coberto.

## Padrão dos arquivos gerados

### types — derivado 100% do contrato

```ts
// types/order.types.ts — gerado a partir de components/schemas/Order no OpenAPI
import { z } from 'zod'

// Mapeia cada campo do schema OpenAPI pro tipo Zod correspondente
export const OrderStatusSchema = z.enum(['pending', 'approved', 'rejected'])

export const OrderSchema = z.object({
  id: z.string().uuid(),
  client_name: z.string(),        // snake_case: Django DRF usa snake_case
  amount: z.string(),             // Decimal do Django vem como string!
  status: OrderStatusSchema,
  created_at: z.string().datetime(),
  // campos opcionais no OpenAPI viram .optional() aqui:
  notes: z.string().optional(),
})

export type Order = z.infer<typeof OrderSchema>
export type OrderStatus = z.infer<typeof OrderStatusSchema>

// Schema de criação — subconjunto do schema completo
export const CreateOrderSchema = OrderSchema.pick({
  client_name: true,
  amount: true,
})
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>
```

### service — paths exatos do contrato

```ts
// services/orders.service.ts
import { http } from '@/core/api/http'
import { OrderSchema, CreateOrderSchema, type Order } from '../types/order.types'
import { z } from 'zod'

// GET /orders/ → retorna lista
export async function fetchOrders(): Promise<Order[]> {
  const { data } = await http.get('/orders/')          // trailing slash Django DRF
  return z.array(OrderSchema).parse(data)
}

// GET /orders/{id}/ → retorna um item
export async function fetchOrder(id: string): Promise<Order> {
  const { data } = await http.get(`/orders/${id}/`)
  return OrderSchema.parse(data)
}

// POST /orders/{id}/approve/ → mutation sem body
export async function approveOrder(id: string): Promise<void> {
  await http.post(`/orders/${id}/approve/`)
}

// POST /orders/ → criação com body
export async function createOrder(body: CreateOrderInput): Promise<Order> {
  const { data } = await http.post('/orders/', body)
  return OrderSchema.parse(data)
}
```

## Pegadinhas comuns do Django DRF

| Tipo no Python | Tipo no JSON | Schema Zod |
|---------------|-------------|------------|
| `DecimalField` | `"1234.56"` (string!) | `z.string()` ou `z.coerce.number()` |
| `DateTimeField` | `"2026-06-09T10:00:00Z"` | `z.string().datetime()` |
| `DateField` | `"2026-06-09"` | `z.string().date()` |
| `UUIDField` | `"a1b2c3d4-..."` | `z.string().uuid()` |
| Campo opcional | ausente no JSON | `z.string().optional()` |
| `null=True` | `null` no JSON | `z.string().nullable()` |
| Nested serializer | objeto aninhado | `z.object({...})` aninhado |
| ManyToMany | array de objetos | `z.array(z.object({...}))` |

**Trailing slash**: DRF usa `/orders/` e `/orders/:id/` — nunca esquecer a barra final. **`DecimalField` como string** é a pegadinha mais comum: `z.number().parse("1234.56")` lança erro em runtime. Use `z.string()` e converta onde precisar exibir, ou `z.coerce.number()` se preferir já receber como número.

## Como aponta divergências

Se o service existente tiver `amount: z.number()` mas o OpenAPI retornar `Decimal` como string, aponta:

```
DIVERGÊNCIA em order.types.ts:

Atual:    amount: z.number()
OpenAPI:  amount: string (Decimal serializado como string)

Se deixar assim, z.number().parse("1234.56") vai lançar erro em runtime.

Sugestão:
  amount: z.string()   // e converte pra número quando precisar exibir
  // ou
  amount: z.coerce.number()  // Zod tenta converter string pra number automaticamente
```

## Como invocar

```
/openapi-contracts orders                          # usa a spec local ou pede a URL
/openapi-contracts http://localhost:8000/api/schema/orders  # URL do endpoint específico
/openapi-contracts — o campo amount mudou no backend  # atualiza só o que mudou
/openapi-contracts products — tem o JSON aqui: {...}  # spec colada direto
```
