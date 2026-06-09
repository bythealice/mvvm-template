---
name: task-breakdown
description: Quebra uma task vaga do Jira em subtasks concretas, ordenadas por dependência, no contexto do MVVM by-feature. Estima complexidade, aponta o que precisa ser clarificado antes de começar. Trigger em: como eu divido isso, quebra essa task, o que precisa ser feito pra X, como estimo Y, monta as subtasks de Z.
---

# task-breakdown

Pega uma task vaga e quebra em subtasks concretas na ordem certa para o MVVM by-feature. O dev sai sabendo exatamente o que fazer, em que sequência, e o que precisa perguntar antes de começar.

## O que confirmar antes de quebrar

Três perguntas que mudam completamente a granularidade do breakdown:

- É **feature nova** (cria arquivos do zero) ou **extensão** (adiciona a algo existente)?
- Tem **design/wireframe**? Se sim, quais ações o usuário executa?
- O **endpoint de backend** está disponível? Se não, vai mockar ou esperar?

Sem essas respostas, o breakdown vai errar a granularidade.

## Estrutura do output

```
BREAKDOWN — [nome da task]

PRÉ-REQUISITOS (confirmar antes de começar)
[ ] [o que precisa estar pronto antes: endpoint, design, auth, etc.]

SUBTASKS — em ordem de desenvolvimento

[1] [layer] [descrição da subtask]
    O que faz: [detalhe do que esse arquivo/mudança entrega]
    Critério de pronto: [como saber que está feito]
    Estimativa: [30min / 1h / 2h]
    Depende de: [sem dependência | subtask #N]

[2] ...

PARALELISMO POSSÍVEL
[Subtasks que podem ser desenvolvidas ao mesmo tempo]

TOTAL ESTIMADO: [soma das estimativas]
```

## Exemplo completo — "Implementar aprovação de pedidos"

```
BREAKDOWN — Implementar aprovação de pedidos (PROJ-47)

PRÉ-REQUISITOS
[x] Endpoint GET /orders/ disponível e retornando { id, clientName, amount, status, createdAt }
[x] Endpoint POST /orders/:id/approve/ disponível
[x] Endpoint POST /orders/:id/reject/ disponível
[ ] Definir qual role pode aprovar (hoje hardcoded como true — PROJ-52 resolve isso)

SUBTASKS

[1] types — Criar order.types.ts
    O que faz: Schema Zod com os 5 campos, tipos inferidos OrderStatus e Order
    Critério de pronto: TypeScript não reclama em nenhum import do schema
    Estimativa: 30min
    Depende de: sem dependência

[2] services — Criar orders.service.ts
    O que faz: fetchOrders (GET), approveOrder (POST), rejectOrder (POST)
    Critério de pronto: cada função parseia a resposta com o schema, tipagem correta
    Estimativa: 45min
    Depende de: #1

[3] viewmodel — Criar useOrdersViewModel.ts
    O que faz: useQuery com fetchOrders, useMutation para approve e reject,
               canApprove hardcoded como true (TODO para PROJ-52)
    Critério de pronto: hook retorna { orders, isLoading, canApprove, onApprove, onReject }
    Estimativa: 1h
    Depende de: #2

[4] view — Criar OrderApproval.tsx
    O que faz: lista pedidos, botões Aprovar/Rejeitar condicionais por status e canApprove,
               data-testid em todos os elementos interativos, loading e error states
    Critério de pronto: renderiza corretamente, sem lógica de negócio, sem import de service
    Estimativa: 1h30
    Depende de: #3

[5] page — Conectar em /orders
    O que faz: thin page que importa OrderApproval do index.ts da feature
    Critério de pronto: rota abre, metadados corretos
    Estimativa: 15min
    Depende de: #4

[6] tests — Vitest para useOrdersViewModel
    O que faz: testa carregamento, canApprove booleano, chamada de approveOrder com id correto,
               state de erro
    Critério de pronto: 4 test cases passando, cobertura do ViewModel acima de 70%
    Estimativa: 1h
    Depende de: #3 (pode ser paralelo com #4)

[7] tests — Cypress E2E para o fluxo de aprovação
    O que faz: testa listagem de pedidos, clique em Aprovar, atualização do status,
               estado desabilitado durante mutation, lista vazia
    Critério de pronto: 4-5 E2E passando com cy.intercept
    Estimativa: 1h
    Depende de: #4 (pode ser paralelo com #6)

[8] docs — write-docs orders
    O que faz: doc técnica + user guide publicados no Confluence via MCP
    Critério de pronto: páginas criadas no espaço correto
    Estimativa: 15min (automatizado pela skill)
    Depende de: #4

PARALELISMO POSSÍVEL
  #6 e #4 podem rodar em paralelo após #3 estar pronto
  #7 pode começar enquanto #6 ainda está em andamento

TOTAL ESTIMADO: ~6h30 (sequencial) / ~5h (com paralelismo em #4 e #6)

PERGUNTAS ABERTAS ANTES DO PR
  • canApprove está hardcoded — ok deixar como TODO pra PROJ-52?
  • O botão de rejeitar precisa de confirmação (modal) ou ação direta?
```

## Estimativas de referência por tipo de arquivo

| Arquivo | Simples | Médio | Complexo |
|---------|---------|-------|---------|
| `*.types.ts` (schema + tipos) | 20min | 40min | 1h |
| `*.service.ts` (2-3 endpoints) | 30min | 1h | 1h30 |
| `use*ViewModel.ts` (query + mutations) | 45min | 1h30 | 3h |
| `*View.tsx` (lista simples) | 45min | 1h30 | 2h30 |
| `*View.tsx` (form complexo) | 1h30 | 3h | 5h |
| Vitest (ViewModel) | 45min | 1h30 | 2h |
| Cypress E2E (fluxo) | 45min | 1h30 | 2h |
| Thin page (rota) | 10min | — | — |

## Como invocar

```
/task-breakdown Implementar aprovação de pedidos
/task-breakdown PROJ-123 — adicionar filtro de pedidos por status
/task-breakdown — como eu divido a feature de usuários com CRUD completo?
/task-breakdown — lista de subtasks pra feature de relatórios financeiros
```
