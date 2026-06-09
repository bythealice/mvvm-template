# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Projeto Next.js 15 com MVVM by-feature. Cada funcionalidade do produto vive na sua própria pasta dentro de `src/features/`. Três camadas com responsabilidades bem definidas: View apresenta, ViewModel decide, Model fornece.

---

## Stack

| Camada           | Tecnologia                     | Onde fica                            |
| ---------------- | ------------------------------ | ------------------------------------ |
| Framework        | Next.js 15 + App Router        | `src/app/`                           |
| Linguagem        | TypeScript strict              | em todo o projeto                    |
| UI               | Tailwind CSS + CVA             | `src/shared/ui/`                     |
| Server state     | TanStack Query v5              | ViewModels                           |
| HTTP             | Axios — instância única        | `src/core/api/http.ts`               |
| Estado global    | Zustand                        | `src/core/store/` — só cross-feature |
| Forms            | React Hook Form + Zod resolver | ViewModels com forms                 |
| Validação        | Zod                            | `features/*/types/`                  |
| Testes de lógica | Vitest                         | `__tests__/features/`                |
| Testes de UI/E2E | Cypress                        | `cypress/`                           |
| Qualidade        | Husky + lint-staged + Sonar    | hooks + CI                           |

---

## Estrutura de pastas

```
src/
├── app/                     # só roteamento — pages finas
│   ├── layout.tsx           # Providers e fonte
│   ├── page.tsx             # Home
│   └── [rota]/
│       └── page.tsx         # importa a View, nada mais
│
├── core/                    # infra compartilhada
│   ├── api/
│   │   └── http.ts          # instância Axios com interceptors
│   ├── providers/
│   │   └── providers.tsx    # QueryClientProvider global
│   └── store/               # Zustand só pra estado cross-feature
│       └── auth.store.ts
│
├── shared/
│   └── ui/                  # componentes sem opinião de produto (CVA)
│       ├── button.tsx       # variantes: primary, outline, ghost, danger
│       ├── badge.tsx        # variantes: pending, approved, rejected
│       ├── skeleton.tsx
│       └── cn.ts            # cn() helper (clsx + tailwind-merge)
│
└── features/
    └── [nome-da-feature]/
        ├── components/      # View — JSX puro, zero lógica
        │   └── [Nome]View.tsx
        ├── hooks/           # ViewModel — orquestra tudo
        │   └── use[Nome]ViewModel.ts
        ├── services/        # Model — API calls validadas
        │   └── [nome].service.ts
        ├── types/           # Schema Zod + tipos inferidos
        │   └── [nome].types.ts
        └── index.ts         # exporta só a View principal
```

---

## A regra central que não quebra

```
View apresenta.
ViewModel decide.
Model fornece.
```

**View** (`components/`):

- Só JSX e Tailwind
- Recebe dados do ViewModel via `use[Nome]ViewModel()`
- Não tem `if (user.role)` — recebe `canApprove: boolean` já calculado
- Não faz fetch, não importa service, não chama `http`
- Tem `data-testid` em todo elemento interativo

**ViewModel** (`hooks/`):

- Hook com `'use client'`
- Orquestra `useQuery` e `useMutation` chamando os services
- Calcula lógica de permissão e estado derivado — lê `useAuthStore` aqui, não na View
- Retorna objeto nomeado (não array destruturado): `{ orders, isLoading, canApprove, onApprove }`
- `staleTime` sempre explícito no `useQuery`
- Não retorna JSX, não importa componente

**Model** (`services/` + `types/`):

- Funções que chamam `http` de `@/core/api/http`
- Validam resposta com `z.array(Schema).parse(data)`
- Não têm estado
- Path exato do backend (Django usa trailing slash: `/orders/`)
- **Os serviços atuais usam mock data com latência simulada** — substituir chamadas por `http.get/post` ao conectar backend real

---

## Convenções de nomenclatura

| Tipo            | Padrão                           | Exemplo                        |
| --------------- | -------------------------------- | ------------------------------ |
| Componente View | PascalCase                       | `OrderApproval.tsx`            |
| ViewModel hook  | `use` + PascalCase + `ViewModel` | `useOrdersViewModel.ts`        |
| Service         | camelCase + `.service.ts`        | `orders.service.ts`            |
| Types           | camelCase + `.types.ts`          | `order.types.ts`               |
| Schema Zod      | PascalCase + `Schema`            | `OrderSchema`                  |
| Query key       | array hierárquico                | `['orders']`, `['orders', id]` |
| data-testid     | kebab-case                       | `order-item`, `btn-approve`    |

---

## Imports

Alias `@/` aponta pra `src/`. Exemplos:

```ts
import { http } from '@/core/api/http'
import { cn } from '@/shared/ui/cn'
import { OrderSchema } from '@/features/orders/types/order.types'
```

---

## Scripts

```bash
npm install        # instala dependências e inicializa o Husky
npm run dev        # localhost:3000
npm run build      # build de produção
npm run lint       # ESLint com fix automático
npm run type-check # TypeScript sem emitir
npm run test       # Vitest em modo watch
npm run test:run   # Vitest uma vez + relatório de coverage

# Rodar um teste específico:
npx vitest run __tests__/features/orders/useOrdersViewModel.test.ts

npm run cypress:open  # Cypress com interface visual
npm run cypress:run   # Cypress headless
```

---

## Testes

**Cobertura**: threshold de 70% aplicado apenas a `src/features/**/hooks/**`. Services, types e componentes não têm threshold.

**Wrapper de teste**: `__tests__/helpers/test-wrapper.tsx` fornece um `QueryClientProvider` com retries desabilitados e `gcTime: 0` para testes determinísticos. Usar sempre que testar ViewModels com `renderHook`.

**Padrão de mock de serviços**:

```ts
vi.mock('@/features/orders/services/orders.service')
const mockFetch = vi.mocked(fetchOrders)
mockFetch.mockResolvedValue(mockOrders)
```

---

## Estado de autenticação

`src/core/store/auth.store.ts` — Zustand com `token` e `role: 'manager' | 'viewer' | null`. O store começa com `role: 'manager'` por padrão (demo). ViewModels leem `role` diretamente via `useAuthStore` para calcular permissões. O interceptor de token em `http.ts` está comentado — descomentar ao integrar auth real.

---

## Componentes UI (shared/ui)

Usam `class-variance-authority` (CVA) para variantes. Ao criar novo componente em `shared/ui`, seguir o mesmo padrão: definir `cva(base, { variants })` e exportar o tipo `VariantProps`.

---

## Formatação

Prettier configurado: sem ponto-e-vírgula, aspas simples, trailing commas ES5, linha máxima de 100 chars. Roda automaticamente via lint-staged no pre-commit.

---

## Husky — o que roda automaticamente

**pre-commit** — roda em cada `git commit`:

- ESLint com fix automático nos arquivos alterados (via lint-staged)
- Prettier nos arquivos alterados
- TypeScript check no projeto inteiro

**commit-msg** — valida a mensagem:

- Formato obrigatório: `tipo: descrição com pelo menos 10 chars`
- Tipos aceitos: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`, `perf`, `revert`

---

## Skills disponíveis (.claude/skills/)

```bash
/mvvm-architect [feature]     # gera feature completa
/ui-component-builder [comp]  # cria componente em shared/ui
/sonar-reviewer               # revisa antes do Sonar reclamar
/refactor [arquivo]           # move lógica pro lugar certo
/openapi-contracts [feature]  # sincroniza types com o OpenAPI
/cypress-tester [feature]     # gera Vitest + E2E
/otel-instrumenter            # adiciona OpenTelemetry
/write-docs [feature]         # documenta e publica no Confluence
/debug [descrição]            # debug contextualizado no MVVM
/pr-writer                    # gera descrição do PR
/code-explainer [arquivo]     # explica código no contexto do projeto
/task-breakdown [task]        # quebra task em subtasks MVVM
```

---

## Feature de exemplo

`src/features/orders/` é a feature de referência — implementa aprovação de pedidos com o padrão completo. Ao criar features novas, usa ela como modelo.
