---
name: debug
description: Ajuda a isolar e diagnosticar um bug dentro da arquitetura MVVM do projeto. Não sai chutando — identifica a camada, isola a causa, sugere o menor fix possível. Trigger em: tá quebrando, esse erro aqui, por que não funciona, o que tá errado, trava nesse ponto, o valor tá undefined.
---

# debug

Diagnostica bugs dentro da arquitetura MVVM do projeto. A abordagem é sempre: identifica a camada → isola a causa → menor fix possível. Não refatora enquanto está debugando — são momentos diferentes.

## Identifica a camada primeiro

O sintoma na tela raramente aponta direto pra causa raiz. A tabela abaixo mapeia onde olhar primeiro:

| Sintoma | Layer suspeita | Onde olhar |
|---------|---------------|------------|
| Dado não aparece na tela | View ou ViewModel | View está consumindo o retorno certo? ViewModel está retornando? |
| Dado aparece undefined ou vazio | ViewModel ou Model | Query retornou? Zod parsou sem erro? |
| Erro de rede (4xx, 5xx, CORS) | Model / http | `src/core/api/http.ts`, path do endpoint, headers |
| Estado não atualiza após ação | ViewModel | `onSuccess` está invalidando a query key certa? |
| Tipo errado (campo undefined em runtime) | Model / types | Schema Zod não bate com o retorno real da API |
| Lógica de permissão errada | ViewModel | `canApprove` ou flag equivalente calculado errado |
| Erro de hidratação SSR | Boundary "use client" | View ou ViewModel sem `'use client'`, ou dado buscado no server |
| Renderização infinita | ViewModel | `useEffect` com dependência instável, objeto recreado a cada render |

## O que precisa saber antes de diagnosticar

Para dar um diagnóstico útil: o erro exato com stack trace completo e linha, o comportamento esperado, o comportamento real, e quando passou a acontecer (após qual mudança, se souber). Se não tiver tudo, pede só o que falta. Não assume.

## O diagnóstico

Diz exatamente onde olhar e o que verificar. Sugere `console.warn` temporário quando necessário para isolar o problema — sempre com aviso explícito pra remover depois.

**Query retornando array vazio sem erro**
```ts
// Verifica: o service está parsando a resposta certa?
export async function fetchOrders(): Promise<Order[]> {
  const { data } = await http.get('/orders/')
  console.warn('[debug] dado bruto da API:', data)  // adiciona temporariamente
  return z.array(OrderSchema).parse(data)
}
// → Remove o console.warn após confirmar o dado
```

**Schema Zod falhando silenciosamente**

O `parse` lança exceção quando o dado não bate com o schema — se não tiver try/catch no service, o erro vai pra `.catch` do `useQuery` sem mensagem clara. Para ver exatamente qual campo não bate:

```ts
try {
  return z.array(OrderSchema).parse(data)
} catch (e) {
  console.error('[debug] falha no parse:', e)
  throw e
}
```

**Mutation não invalida o cache**
```ts
// Verifica se a query key bate exatamente
const approve = useMutation({
  mutationFn: approveOrder,
  onSuccess: () => {
    console.warn('[debug] invalidando cache')
    queryClient.invalidateQueries({ queryKey: ['orders'] })
    // query key usada no useQuery: ['orders'] — bate?
  },
})
```

Uma letra diferente na query key e o `invalidateQueries` não encontra nada — o cache não é invalidado e a lista não atualiza.

**Erro de hidratação: "Text content does not match server-rendered HTML"**
```ts
// A View ou o ViewModel está sem 'use client'
// ou está usando localStorage/window sem verificar se está no browser

// ❌ quebrando na hidratação
const token = localStorage.getItem('token')  // window não existe no server

// ✅
const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
```

**Dado undefined mesmo com dado na tela anterior**
```ts
// staleTime: 0 + componente remonta = refetch a cada render
// Verifica se staleTime está explícito:
useQuery({
  queryKey: ['orders'],
  queryFn: fetchOrders,
  staleTime: 1000 * 60 * 2,  // se faltar, é staleTime: 0
})
```

**TypeScript acusa mas o código "funciona"**
```ts
// Não ignora erro de tipo com 'as' ou '!'
// O TypeScript está certo — o runtime vai quebrar num edge case
const name = user.profile!.name  // ❌ se profile for undefined, quebra

const name = user.profile?.name ?? 'Padrão'  // ✅
```

## O que não faz durante debug

Não reescreve código que não é o problema. Não sugere refactor enquanto está debugando — são PRs diferentes. Não adiciona `console.log` em prod, só em dev e com aviso explícito pra remover. Não assume onde está o problema sem verificar primeiro. Não sugere "tenta deletar o node_modules" antes de entender o erro.

## Como invocar

```
/debug o useOrdersViewModel retorna orders vazio mas a API retorna dados
/debug TypeError: Cannot read properties of undefined (reading 'clientName') OrderApproval.tsx:45
/debug o botão de aprovar some depois de clicar mas o status não atualiza na UI
/debug Zod parse error: Expected string, received number at path "amount"
```

Quanto mais contexto, melhor o diagnóstico. Cola o erro completo quando tiver.
