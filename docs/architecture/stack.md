# Stack — Projetos novos Volix

Padrão arquitetural dos projetos Next.js na Volix. Essa doc cobre as decisões de tecnologia e os trade-offs considerados — não é uma lista de libs, é o raciocínio por trás de cada escolha.

## Estrutura: MVVM by-feature

Cada funcionalidade do produto vive em `src/features/[nome]/` com três camadas:

```
features/orders/
├── components/   # View   — só JSX, recebe dados, não decide nada
├── hooks/        # ViewModel — orquestra query, form, handlers, permissões
├── services/     # Model  — única camada que fala com o backend
└── types/        # Schema Zod + tipos inferidos
```

**A regra que não quebra:** View apresenta. ViewModel decide. Model fornece.

O problema que isso resolve: em projetos anteriores, remover uma feature exigia cirurgia em `src/components/`, `src/hooks/`, `src/types/` separados. Aqui, deletar `features/orders/` é suficiente.

## Camada de dados: TanStack Query v5

Server state gerenciado pelo TanStack Query. `staleTime` sempre explícito — o padrão é `staleTime: 0`, que refaz o fetch a cada foco de janela. Cada query define o tempo certo pra seu contexto.

Estado cross-feature (sessão, tema, flags globais) fica no Zustand em `src/core/store/`. Features não importam umas das outras — cruzam via store.

## HTTP: Axios com instância única

Uma instância em `src/core/api/http.ts` com interceptors de auth e timeout de 10s. Services importam dessa instância — nunca criam `axios.create()` próprio. O interceptor de 401 centraliza o redirect pro login.

## Formulários: React Hook Form + Zod

Zod é a fonte da verdade dos tipos. Schemas ficam em `features/*/types/` e são usados tanto pra validar respostas de API (`z.array(Schema).parse(data)`) quanto pra validar formulários (via `zodResolver`). TypeScript deriva os tipos do schema, nunca o contrário.

## UI: Tailwind + shadcn/ui

Tokens de cor e fonte em `tailwind.config.ts` — nada de hex hardcoded nos componentes. `src/shared/ui/` contém os primitivos editáveis: `Button`, `Badge`, `Skeleton`, etc. Componentes de produto ficam em `features/*/components/`, nunca em `shared/ui/`.

## Qualidade: Husky + Sonar

**Husky (local, antes do commit)**
- `pre-commit`: lint-staged nos arquivos alterados + TypeScript check no projeto inteiro
- `commit-msg`: Conventional Commits obrigatório — `feat:`, `fix:`, `docs:`, etc.

**SonarQube (CI, a cada PR)**
- Bugs, vulnerabilidades, code smells e cobertura de testes
- Quality Gate bloqueia o merge se não passar
- Cobertura mínima: 70% de linhas e funções nos ViewModels

## Testes: três camadas

| Camada | Ferramenta | O que testa |
|--------|-----------|-------------|
| Lógica pura | Vitest | ViewModel isolado — mock do service, sem browser |
| Comportamento visual | Cypress Component | View renderizada com ViewModel mockado |
| Fluxos críticos | Cypress E2E | Do clique ao resultado, app rodando |

O relatório de cobertura (`coverage/lcov.info`) é lido pelo Sonar.

## Observabilidade: OpenTelemetry → GCP

`instrumentation.ts` na raiz do projeto. Next.js 15 carrega automaticamente. Traces vão pro GCP Cloud Trace via Grafana Alloy. Custo praticamente zero no free tier para dev e homologação.

## Docs: Confluence via Atlassian MCP

A skill `/write-docs` lê o código da feature e publica no Confluence automaticamente. Os templates ficam em `docs/_templates/`. O `docs/` no repo é a source of truth — o Confluence é o espelho.
