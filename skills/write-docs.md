---
name: write-docs
description: Documenta uma feature e publica no Confluence via Atlassian MCP. Gera documentação técnica para devs (arquitetura, tipos, fluxo de dados) e user guide para usuários/PO (o que fazer, passo a passo). Trigger em: documenta X, gera doc de Y, publica no Confluence, escreve a documentação, o que eu coloco na wiki.
---

# write-docs

Documenta uma feature e publica no Confluence via Atlassian MCP. O dev termina a feature, invoca a skill, a doc aparece no Confluence — sem copiar e colar nada.

## O que fazer antes de documentar

Lê os arquivos da feature — types, service, ViewModel, View. A doc deriva do código, não de suposições. Confirma o espaço no Confluence antes de publicar; se não souber onde vai, pergunta. Verifica se já existe uma página para essa feature: se sim, atualiza em vez de criar duplicata.

Se o pedido não nomear a feature ("documenta isso aqui"), pede o nome ou o caminho antes de prosseguir.

## O que gera

Para uma feature `[nome]`, gera dois artefatos.

### Documentação técnica → `docs/features/[nome].md`

Para devs. Foco em arquitetura, tipos, fluxo de dados, decisões tomadas. Alguém que nunca viu essa feature precisa entender o que é, como funciona, e onde mexer.

```markdown
# [Feature] — Documentação técnica

## O que é

[1-3 frases descrevendo o propósito. O que o usuário consegue fazer. Qual problema resolve.]

## Estrutura MVVM

### View — `src/features/[nome]/components/[Nome]View.tsx`
O que renderiza, quais ações expõe pro usuário, quais `data-testid` tem.
Não tem lógica — recebe tudo do ViewModel.

### ViewModel — `src/features/[nome]/hooks/use[Nome]ViewModel.ts`
O que orquestra. Queries usadas, mutations disponíveis, lógica de permissão.

Query keys: `['[nome]']`, `['[nome]', id]`

Retorno exposto:
- `[items]` — lista do recurso
- `isLoading` — estado de carregamento
- `can[Ação]` — permissões calculadas (booleano)
- `on[Ação]` — handlers das ações

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
  [campos relevantes]
  status: '[status-a]' | '[status-b]'
}
```

## Como testar localmente

1. `npm run dev`
2. Abre `localhost:3000/[rota]`
3. [Passos específicos pra ver a feature funcionando]

## Decisões técnicas

[Se houve uma escolha não-óbvia, documenta aqui: por que staleTime de X minutos, por que esse endpoint e não aquele, por que esse schema Zod]
```

### User guide → `docs/user-guides/[nome].md`

Para usuários e PO. Foco no que fazer, não em como está implementado.

```markdown
# [Feature] — Guia de uso

## O que você consegue fazer aqui

[1-2 frases descrevendo a funcionalidade do ponto de vista do usuário]

## Passo a passo

### [Ação principal]

1. Acessa [rota da tela]
2. [O que aparece na tela]
3. [O que o usuário faz]
4. [O que acontece em seguida]

### O que acontece em cada situação

| Situação | O que aparece |
|----------|--------------|
| Dados carregando | Spinner / mensagem de carregamento |
| Sem itens | Mensagem de lista vazia |
| Erro de rede | Mensagem de erro com instrução |
| Ação bem-sucedida | [Feedback visual ou redirecionamento] |
```

## Publicando no Confluence via MCP

**Doc técnica** vai em: espaço da equipe → Arquitetura → Features → `[Nome da feature]`

**User guide** vai em: espaço da equipe → Guias de usuário → `[Nome da feature]`

Se não tiver certeza do espaço certo, lista os espaços disponíveis antes de publicar:
```
Atlassian MCP: list spaces
```

Nunca publica em lugar errado sem confirmar — reorganizar página no Confluence é trabalhoso.

## Quando o MCP não está autenticado

Se o Atlassian MCP não estiver conectado, gera os arquivos localmente em `docs/features/` e `docs/user-guides/` e avisa: "O MCP não está autenticado — doc gerada localmente em `docs/`. Para publicar no Confluence, autentica em Claude.ai → Settings → Integrations → Atlassian e roda `/write-docs [feature]` de novo."

Não finge que publicou quando não publicou.

## Como invocar

```
/write-docs orders                 # gera doc técnica + user guide + publica
/write-docs orders só-técnica      # só a doc técnica
/write-docs orders local           # gera localmente sem publicar
/write-docs orders atualiza        # atualiza página existente no Confluence
```
