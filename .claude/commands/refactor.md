---
name: refactor
description: Move lógica pro lugar certo na arquitetura MVVM sem quebrar o comportamento. Identifica o cheiro, faz o menor movimento possível. Trigger em: refatora, move essa lógica, tá no lugar errado, limpa esse arquivo, tem muita coisa nesse componente.
---

# refactor

Identifica onde a lógica está fora do lugar na arquitetura MVVM e move pro lugar certo. O comportamento não muda — só a organização. Diff mínimo, sem surpresa.

## Antes de qualquer mudança

**Lê o arquivo inteiro** antes de tocar — entende o que o código faz, não só a linha errada. Se tem teste, anota o que está coberto; o comportamento preservado é o critério de sucesso. Planeja o menor movimento possível — não refatora além do que foi pedido.

Se descobrir outro problema no caminho, **aponta mas não toca** sem autorização. São dois PRs diferentes.

## Os cheiros mais comuns e o fix

### Lógica ou fetch na View

**Sintoma**: `useEffect`, `useState`, `fetch`, `axios.get`, `if (user.role)` dentro de um componente `.tsx`.

```tsx
// ❌ View fazendo trabalho de ViewModel
export function OrdersView() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    http.get('/orders/').then(({ data }) => {
      setOrders(z.array(OrderSchema).parse(data))
      setIsLoading(false)
    })
  }, [])

  const pending = orders.filter((o) => o.status === 'pending')
  const canApprove = user.role === 'manager' // lógica de permissão na View!

  return <ul>...</ul>
}

// ✅ Move pro ViewModel — View fica só com JSX
export function useOrdersViewModel() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
    staleTime: 1000 * 60 * 2,
  })

  const pendingOrders = orders.filter((o) => o.status === 'pending')
  const canApprove = true // TODO: contexto de auth

  return { pendingOrders, isLoading, canApprove }
}

export function OrdersView() {
  const { pendingOrders, isLoading, canApprove } = useOrdersViewModel()
  return <ul>...</ul>
}
```

### Chamada http direta no ViewModel

**Sintoma**: `http.get`, `axios.post`, `fetch` dentro de um hook.

```ts
// ❌ ViewModel chamando http diretamente
export function useOrdersViewModel() {
  const { data } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data } = await http.get('/orders/') // pertence ao service
      return z.array(OrderSchema).parse(data)
    },
  })
}

// ✅ Extrai pro service, ViewModel delega
// services/orders.service.ts
export async function fetchOrders(): Promise<Order[]> {
  const { data } = await http.get('/orders/')
  return z.array(OrderSchema).parse(data)
}

// hooks/useOrdersViewModel.ts
export function useOrdersViewModel() {
  const { data } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders, // referência à função do service
    staleTime: 1000 * 60 * 2,
  })
}
```

### Feature importando outra feature

**Sintoma**: `import { ... } from '@/features/[outra-feature]'` dentro de uma feature. Estado que precisa cruzar features pertence ao `core/store`, não a uma feature específica.

```ts
// ❌ acoplamento indevido entre features
import { useAuthViewModel } from '@/features/auth'

export function useOrdersViewModel() {
  const { currentUser } = useAuthViewModel()  // acoplado à feature auth
  const canApprove = currentUser.role === 'manager'
}

// ✅ Estado cross-feature fica no core
// core/store/session.ts (Zustand)
export const useSession = create<SessionState>(...)

// hooks/useOrdersViewModel.ts
import { useSession } from '@/core/store/session'

export function useOrdersViewModel() {
  const { currentUser } = useSession()
  const canApprove = currentUser?.role === 'manager'
}
```

### ViewModel retornando JSX ou importando componente

**Sintoma**: `return <div>`, import de componente React dentro de um hook.

```ts
// ❌ ViewModel com responsabilidade de View
export function useOrdersViewModel() {
  if (isLoading) return <div>Carregando...</div>  // NÃO
  return { orders }
}

// ✅ ViewModel só retorna dados/handlers
export function useOrdersViewModel() {
  return { orders, isLoading }
}

// View cuida do loading state
export function OrdersView() {
  const { orders, isLoading } = useOrdersViewModel()
  if (isLoading) return <div>Carregando...</div>
  return <ul>...</ul>
}
```

### useQuery sem staleTime

**Sintoma**: `useQuery` sem `staleTime` explícito. O padrão implícito é `staleTime: 0` — toda vez que a janela ganha foco, um refetch é disparado.

```ts
// ❌ staleTime: 0 implícito — refetch a cada foco de janela
useQuery({
  queryKey: ['orders'],
  queryFn: fetchOrders,
})

// ✅ staleTime explícito e intencional
useQuery({
  queryKey: ['orders'],
  queryFn: fetchOrders,
  staleTime: 1000 * 60 * 2, // 2 min — dados de lista raramente mudam em segundos
})
```

## Regras do refactor

**Preserva o comportamento** — se tem teste, roda antes e depois: os dois precisam passar. **Diff mínimo** — não formata código que não é o foco, não renomeia variável sem motivo. **Nomeia o que mudou** — lista os arquivos tocados e uma frase por arquivo. **Não mistura refactor com feature** — se o refactor revelou um bug, aponta mas não corrige junto. **Não cria camada desnecessária** — se a chamada de API for trivial (uma linha), pode ficar inline no ViewModel sem precisar de service separado.

## Como invocar

```
/refactor src/features/orders/components/OrderApproval.tsx
/refactor — move o fetch do useEffect pro ViewModel
/refactor — a lógica de permissão tá na View, move pro ViewModel
/refactor — tem http.get no hook, extrai pro service
```
