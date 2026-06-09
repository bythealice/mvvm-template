---
name: sonar-reviewer
description: Revisa código ou diff e aponta o que o SonarQube vai reclamar antes do PR ir pro CI. Funciona como um Sonar local, antes de commitar. Trigger em: revisa pra mim, o que o Sonar vai pegar aqui, passa o olho antes do PR, valida esse código, tá limpo isso?
---

# sonar-reviewer

Lê o código ou diff e aponta exatamente o que o SonarQube vai reclamar — antes de o CI falhar, antes de o PR ser bloqueado, antes de você ter que voltar e corrigir depois de esperar 5 minutos de pipeline.

## Bugs (bloqueiam o Quality Gate)

**Promise sem await**

```ts
// ❌ Sonar: "Add await to this Promise"
async function loadData() {
  fetchProducts() // Promise ignorada — dado nunca é aguardado
}

// ✅
async function loadData() {
  await fetchProducts()
}
```

**Null/undefined não tratado**

```ts
// ❌ Sonar: "Object is possibly undefined"
const name = user.profile.name // profile pode ser undefined

// ✅
const name = user.profile?.name ?? 'Sem nome'
```

**Comparação não-estrita**

```ts
// ❌ Sonar: "Use === instead of =="
if (status == 'pending') { ... }

// ✅
if (status === 'pending') { ... }
```

**Return em todos os branches**

```ts
// ❌ Sonar: "Function lacks return statement"
function getLabel(status: string) {
  if (status === 'pending') return 'Pendente'
  if (status === 'approved') return 'Aprovado'
  // faltou o caso 'rejected'
}
```

## Vulnerabilidades (bloqueiam o Quality Gate)

**Dados do usuário em innerHTML**

```tsx
// ❌ Sonar: "Make sure user content is sanitized"
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

**Credenciais hardcoded**

```ts
// ❌ Sonar: "Hard-coded credentials"
const token = 'eyJhbGciOiJIUzI1NiJ9...'
const apiKey = 'sk-prod-abc123'
```

**Regex sem timeout (ReDoS)**

```ts
// ❌ padrão vulnerável a ReDoS
const regex = /^(a+)+$/
```

## Code Smells (impactam a nota mas não bloqueiam)

**Função longa demais** — mais de 20 linhas fazendo coisas demais. Sonar aponta como "Refactor this function to reduce its Cognitive Complexity". Fix: extrair em funções menores com nome descritivo.

**Arquivo longo demais** — mais de 200 linhas em `.ts` ou `.tsx`. Sonar aponta como "This file has N lines, which is greater than 200". Fix: extrair componente, hook, ou utility separado.

**Duplicação de lógica**

```ts
// ❌ Mesma lógica em dois lugares
// orders.service.ts
const data = response.data
const parsed = OrderSchema.parse(data)

// products.service.ts
const data = response.data
const parsed = ProductSchema.parse(data)

// ✅ Extrai um helper genérico quando a duplicação vira padrão
function parseResponse<T>(schema: z.ZodType<T>, data: unknown): T {
  return schema.parse(data)
}
```

**Dead code**

```ts
// ❌ Sonar: "Remove this useless assignment"
const temp = calculateTotal() // declarado, nunca usado

// ❌ Sonar: "Remove this commented code"
// const old = getOldData()
// return old.map(...)
```

**`any` explícito**

```ts
// ❌ Sonar: "Unexpected any. Specify a different type"
function processData(data: any) { ... }

// ✅
function processData(data: unknown) {
  // valida com Zod antes de usar
}
```

## Cobertura (impacta o Quality Gate se abaixo do threshold)

O projeto configura `thresholds: { lines: 70, functions: 70 }` no `vitest.config.ts`. ViewModel sem teste em `__tests__/features/` derruba a cobertura. Lógica condicional no ViewModel (`if canApprove`, error handling) sem test case deixa branches descobertos — o Sonar conta branch por branch.

## Problemas específicos do projeto (Sonar + regras ESLint)

```ts
// ❌ useQuery sem staleTime — viola convenção do projeto
useQuery({
  queryKey: ['orders'],
  queryFn: fetchOrders,
  // staleTime ausente!
})

// ❌ Fetch na View — viola MVVM
export function OrdersView() {
  const [data, setData] = useState([])
  useEffect(() => {
    fetch('/api/orders').then(...)  // pertence ao service
  }, [])
}

// ❌ Feature importando outra feature
import { useAuthViewModel } from '@/features/auth'  // violação de isolamento
```

## Formato do retorno

Para cada problema encontrado:

```
[TIPO] src/features/.../arquivo.ts:linha
Problema: [descrição do que está errado em linguagem natural]
Sonar vai apontar como: [nome da regra ou mensagem]
Sugestão: [como corrigir, com exemplo quando útil]
```

Agrupa por tipo: Bugs primeiro, depois Vulnerabilidades, depois Smells, depois Cobertura.

Se o código estiver limpo, diz isso direto: "Nenhum problema encontrado que o Sonar vai pegar. Pode commitar."

Não inventa problema onde não tem. Não sugere refactor além do que o Sonar realmente reclama.

## Como invocar

```
/sonar-reviewer
/sonar-reviewer src/features/orders/hooks/useOrdersViewModel.ts
/sonar-reviewer — olha o diff do último commit
/sonar-reviewer — antes de abrir o PR
```
