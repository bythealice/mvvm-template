# [Feature] — Documentação técnica

## O que é

[1-3 frases descrevendo o propósito. O que o usuário consegue fazer. Qual problema resolve.]

## Estrutura MVVM

### View — `src/features/[nome]/components/[Nome]View.tsx`

O que renderiza, quais ações expõe pro usuário, quais `data-testid` tem. Não tem lógica — recebe tudo do ViewModel.

### ViewModel — `src/features/[nome]/hooks/use[Nome]ViewModel.ts`

O que orquestra. Queries usadas, mutations disponíveis, lógica de permissão calculada.

Query keys: `['[nome]']`, `['[nome]', id]`

Retorno exposto:

| Campo | Tipo | O que é |
|-------|------|---------|
| `[items]` | `[Nome][]` | Lista do recurso |
| `isLoading` | `boolean` | Estado de carregamento |
| `can[Ação]` | `boolean` | Permissão calculada — View não verifica role |
| `on[Ação]` | `(id: string) => void` | Handler da ação principal |

### Model — `src/features/[nome]/services/[nome].service.ts`

Endpoints consumidos:

| Função | Método | Path | Retorno |
|--------|--------|------|---------|
| `fetch[Nomes]` | GET | `/[path]/` | `[Nome][]` |
| `[ação][Nome]` | POST | `/[path]/:id/[ação]/` | `void` |

Schema de validação: `[Nome]Schema` em `types/[nome].types.ts`

## Tipos principais

```ts
type [Nome] = {
  id: string
  // campos relevantes
  status: '[status-a]' | '[status-b]'
  createdAt: string
}
```

## Como testar localmente

1. `npm run dev`
2. Abre `localhost:3000/[rota]`
3. [Passos específicos pra ver a feature funcionando]

## Decisões técnicas

[Se houve uma escolha não-óbvia: por que staleTime de X minutos, por que esse endpoint e não aquele, por que esse schema Zod.]
