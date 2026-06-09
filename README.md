# MVVM by-feature — Template Next.js · Volix

Template de arquitetura para projetos Next.js 14+ seguindo o padrão **MVVM by-feature**.

---

## Stack

- **Next.js 14** (App Router) + **TypeScript** strict
- **Tailwind CSS** com tokens da Volix
- **TanStack Query** para server state
- **Axios** configurado em `src/core/api/`
- **Zustand** para estado cross-feature
- **React Hook Form** + **Zod** para formulários e validação
- **Cypress** para component tests e E2E

---

## Estrutura

```
src/
├── app/                          # Rotas Next.js — só roteamento e metadata
│   └── orders/page.tsx           # Thin: renderiza <OrdersView />
├── core/
│   ├── api/http.ts               # Axios instance + interceptors
│   ├── providers/providers.tsx   # QueryClient, tema, etc.
│   └── store/auth.store.ts       # Zustand — estado cross-feature
├── shared/ui/
│   ├── button.tsx                # Primitivos shadcn-style
│   ├── badge.tsx
│   └── skeleton.tsx
└── features/
    └── orders/                   # Feature completa, vertical
        ├── components/
        │   ├── OrdersView.tsx        # View principal (entry point)
        │   ├── OrdersTable.tsx       # View — tabela de pedidos
        │   └── OrderActionModal.tsx  # View — modal de aprovação/rejeição
        ├── hooks/
        │   └── useOrdersViewModel.ts # ViewModel — orquestra tudo
        ├── services/
        │   └── orders.service.ts     # Model — chamadas de API
        ├── types/
        │   └── order.types.ts        # Model — Zod schemas + tipos
        └── index.ts                  # Exporta só OrdersView
```

---

## MVVM em uma linha

| Camada | Arquivo | Responsabilidade |
|---|---|---|
| **View** | `components/*.tsx` | Só JSX. Recebe dados do ViewModel. Sem lógica. |
| **ViewModel** | `hooks/use*ViewModel.ts` | Hook que orquestra query, form, handlers e permissões. |
| **Model** | `services/` + `types/` | API calls e Zod schemas. Única camada que fala com o backend. |

---

## Como rodar

```bash
# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env.local

# Rodar em desenvolvimento
npm run dev

# Rodar testes e2e (com o app rodando)
npx cypress run --e2e

# Rodar component tests
npx cypress run --component
```

---

## Adicionando uma nova feature

1. Crie `src/features/<nome>/`
2. Defina os tipos em `types/<nome>.types.ts` com Zod
3. Crie o serviço em `services/<nome>.service.ts`
4. Crie o ViewModel em `hooks/use<Nome>ViewModel.ts`
5. Construa as Views em `components/`
6. Exporte só a View principal em `index.ts`
7. Crie a página magra em `src/app/<rota>/page.tsx`

---

## Regras que não quebram

- **View não faz fetch.** Nunca.
- **ViewModel não retorna JSX.** Nunca.
- **Features não importam de outras features.** Componentes compartilhados → `shared/ui/`. Infraestrutura → `core/`.
- **Estado de servidor fica no TanStack Query.** Zustand é só para estado cross-feature (auth, tema, flags globais).
- **index.ts exporta só a View principal.** Nada mais.
