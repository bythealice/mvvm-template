---
name: mvvm-architect
description: Gera uma feature completa no padrão MVVM by-feature — View, ViewModel, Model, types e barrel export. Usa quando o dev pede pra criar uma feature nova, scaffoldar arquivos, adicionar uma tela, ou estender uma feature existente. Trigger em qualquer pedido de criação de feature, tela, componente conectado a dados, ou "monta o MVVM pra X".
---

# mvvm-architect

Gera os arquivos de uma feature completa no padrão MVVM by-feature do projeto. O output é código funcionando — não esqueleto, não `// TODO`. Cada arquivo faz a sua parte sem invadir as outras.

## Lê primeiro, gera depois

Não assume convenções. Antes de qualquer geração:

1. **Abre `src/features/orders/`** — feature de referência do projeto. Observa como o ViewModel nomeia o objeto de retorno, se `staleTime` está explícito (aqui sim — obrigatório), como o `index.ts` está escrito.
2. **Abre `src/core/api/http.ts`** — confirma o alias de import. Usa `@/core/api/http`.
3. **Abre `package.json`** — confirma que TanStack Query, Zod e axios estão instalados. Não introduz lib nova sem perguntar.
4. **Abre `tailwind.config.ts`** — se tiver tokens customizados de cor ou font, usa eles. Nunca hardcode hex ou cor genérica quando existe token.

Se a feature for ambígua (muitas telas, muitas ações), pergunta qual é a tela principal antes de gerar. Uma pergunta focada vale mais que gerar a coisa errada.

## Estrutura gerada

Para `src/features/[nome]/`:

```
[nome]/
├── types/
│   └── [nome].types.ts       # Schema Zod + tipos com z.infer
├── services/
│   └── [nome].service.ts     # Chamadas de API validadas com Zod
├── hooks/
│   └── use[Nome]ViewModel.ts # Orquestra queries, mutations, lógica, permissões
├── components/
│   └── [Nome]View.tsx         # JSX puro — zero lógica, zero fetch
└── index.ts                   # Exporta só a View principal
```

A ordem importa: **types → services → ViewModel → View**. Cada camada depende da anterior — não inverte.

## Padrão de cada arquivo

### types/[nome].types.ts

Começa aqui. O schema Zod é a fonte da verdade — tipos TypeScript derivam dele, nunca o contrário. Cria sub-schemas quando precisar validar partes isoladas (body de criação, body de update). Nunca repete campos em interfaces TypeScript separadas.

```ts
// types/product.types.ts
import { z } from 'zod'

export const ProductStatusSchema = z.enum(['active', 'inactive', 'draft'])

export const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
  status: ProductStatusSchema,
  createdAt: z.string().datetime(),
})

export type Product = z.infer<typeof ProductSchema>
export type ProductStatus = z.infer<typeof ProductStatusSchema>
```

### services/[nome].service.ts

Importa `http` de `@/core/api/http`. Toda resposta passa pelo schema antes de sair da função — nada de `any`, nada de `as Product`. Trailing slash em rotas Django DRF — sempre. Função por endpoint, nome descritivo.

```ts
// services/products.service.ts
import { http } from '@/core/api/http'
import { ProductSchema, type Product } from '../types/product.types'
import { z } from 'zod'

export async function fetchProducts(): Promise<Product[]> {
  const { data } = await http.get('/products/')
  return z.array(ProductSchema).parse(data)
}

export async function createProduct(
  body: Pick<Product, 'name' | 'price' | 'stock'>
): Promise<Product> {
  const { data } = await http.post('/products/', body)
  return ProductSchema.parse(data)
}

export async function deleteProduct(id: string): Promise<void> {
  await http.delete(`/products/${id}/`)
}
```

### hooks/use[Nome]ViewModel.ts

Começa com `'use client'`. Retorna um **objeto nomeado** — não array, não valores soltos. `staleTime` explícito em todo `useQuery` — omitir equivale a `staleTime: 0`, o que dispara refetch a cada foco de janela. Lógica de permissão fica aqui — a View nunca verifica `user.role` diretamente.

```ts
// hooks/useProductsViewModel.ts
'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchProducts, createProduct, deleteProduct } from '../services/products.service'

export function useProductsViewModel() {
  const queryClient = useQueryClient()

  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5, // explícito sempre — 5 min aqui é intencional
  })

  const create = useMutation({
    mutationFn: createProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })

  const remove = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })

  // permissão calculada aqui — View recebe booleano pronto
  const canCreate = true // TODO: puxar do contexto de auth real
  const canDelete = true // TODO: idem

  return {
    products,
    isLoading,
    error,
    canCreate,
    canDelete,
    onCreateProduct: create.mutate,
    onDeleteProduct: remove.mutate,
    isCreating: create.isPending,
    isDeleting: remove.isPending,
  }
}
```

Se a feature tiver form, o `useForm` fica no ViewModel, não na View. A View recebe `form`, `onSubmit`, `isSubmitting`.

### components/[Nome]View.tsx

Começa com `'use client'`. Chama o ViewModel. Renderiza o que recebeu. Sem `if (user.role)`, sem chamada de service, sem import de `http`. `data-testid` em todo elemento interativo — sem exceção.

```tsx
// components/ProductsView.tsx
'use client'

import { useProductsViewModel } from '../hooks/useProductsViewModel'
import { Button } from '@/shared/ui/Button'
import type { Product } from '../types/product.types'

export function ProductsView() {
  const { products, isLoading, error, canCreate, canDelete, onDeleteProduct, isDeleting } =
    useProductsViewModel()

  if (isLoading) {
    return <div className="p-8 text-gray-500">Carregando...</div>
  }

  if (error) {
    return <div className="p-8 text-red-600">Erro ao carregar produtos.</div>
  }

  return (
    <section className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Produtos</h1>
        {canCreate && <Button data-testid="btn-create-product">Novo produto</Button>}
      </div>

      <ul className="space-y-3">
        {products.map((product: Product) => (
          <li
            key={product.id}
            data-testid="product-item"
            className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
          >
            <div>
              <p className="font-medium">{product.name}</p>
              <p className="text-sm text-gray-500">
                R$ {product.price.toFixed(2)} — estoque: {product.stock}
              </p>
            </div>
            {canDelete && (
              <Button
                data-testid="btn-delete-product"
                variant="destructive"
                size="sm"
                onClick={() => onDeleteProduct(product.id)}
                disabled={isDeleting}
              >
                Excluir
              </Button>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
```

### index.ts

Exporta só a View. Nada mais — types, hooks e services não saem pelo barrel.

```ts
export { ProductsView } from './components/ProductsView'
```

## Quando a feature tem form

O form fica no ViewModel. A View recebe `form`, `onSubmit` e `isSubmitting` — não instancia `useForm` sozinha.

```ts
// hooks/useCreateProductViewModel.ts
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createProduct } from '../services/products.service'

const CreateProductSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  price: z.coerce.number().positive('Preço deve ser positivo'),
  stock: z.coerce.number().int().nonnegative(),
})

type CreateProductForm = z.infer<typeof CreateProductSchema>

export function useCreateProductViewModel() {
  const queryClient = useQueryClient()

  const form = useForm<CreateProductForm>({
    resolver: zodResolver(CreateProductSchema),
    defaultValues: { name: '', price: 0, stock: 0 },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      form.reset()
    },
  })

  return {
    form,
    onSubmit: form.handleSubmit((data) => mutate(data)),
    isSubmitting: isPending,
  }
}
```

## Regras que nunca quebram

- `data-testid` em todo elemento interativo — botões, inputs, items de lista, status badges
- `staleTime` sempre explícito no `useQuery` — nunca omite
- View nunca importa service diretamente
- ViewModel nunca retorna JSX
- `index.ts` exporta só a View principal — nada de reexportar types, hooks, services
- Nomes derivados da feature: `ProductSchema`, `fetchProducts`, `useProductsViewModel`
- Service nunca tem estado ou `useState`

## Reconhece qual forma invocar

| Pedido                                             | O que faz                                  |
| -------------------------------------------------- | ------------------------------------------ |
| "cria feature products"                            | Gera todos os 5 arquivos                   |
| "adiciona mutation de criação na feature products" | Estende o service e o ViewModel existentes |
| "cria tela de detalhe de produto"                  | Adiciona componente e ViewModel de detalhe |
| "refatora — tem fetch no componente"               | Usa a skill /refactor em vez desta         |

## Formato de entrega

Uma frase dizendo o que vai gerar e a decisão principal. Os arquivos em ordem: types → services → ViewModel → View → index.ts. Uma nota curta com: query key usada, `data-testid` criados, próximos passos óbvios (testes).

Sem preamble, sem recap do que acabou de escrever, sem "espero que ajude".
