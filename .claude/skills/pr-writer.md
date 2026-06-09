---
name: pr-writer
description: Gera uma descrição de PR bem escrita a partir do diff ou das mudanças descritas. O revisor entende o que mudou, por que mudou, e como testar — sem precisar ler cada linha de código. Trigger em: escreve o PR, gera a descrição do PR, o que eu coloco no PR, antes de abrir o PR, monta o pull request.
---

# pr-writer

Gera a descrição do PR. O objetivo é que o revisor entenda o contexto, a mudança, e consiga testar — sem precisar perguntar nada.

## Antes de gerar

Se tiver acesso ao diff (`git diff main...HEAD`), lê antes de perguntar qualquer coisa. O diff já responde a maioria das questões. Se não tiver diff disponível, pede uma descrição das mudanças em linguagem natural — o dev não precisa escrever técnico, só o que mudou e por quê.

## Estrutura do PR

```markdown
## O que mudou

[1-3 frases descrevendo o que foi implementado, corrigido, ou refatorado.
Foco no comportamento — não na implementação.
Certo: "Adiciona aprovação de pedidos na tela de orders"
Errado: "Cria função approveOrder em orders.service.ts e chama via useMutation"]

## Por que

[O contexto — task do Jira, bug reportado, pedido de usuário, decisão técnica.
Basta uma frase se for óbvio. Duas ou três se precisar de contexto.]

## Como testar

1. `npm run dev`
2. Abre `/[rota]`
3. [Ação específica que mostra a mudança]
4. [O que deve acontecer — comportamento esperado]

Se houver edge case importante:

- **Cenário de erro**: [como testar o caso de falha]

## Arquivos que mudaram

- `src/features/orders/` — [o que mudou na feature]
- `__tests__/features/orders/` — [o que o teste cobre]

## Notas pra revisão

[Opcional — só quando tiver algo não-óbvio:]

- Decisão técnica que pode causar dúvida
- Trade-off consciente
- TODO que ficou pro próximo PR
- Breaking change
```

## Regras do output

**Descreve comportamento, não implementação.**

```
✅ "Adiciona botão de aprovação e rejeição pra pedidos pendentes"
❌ "Cria useMutation pra approveOrder e rejectOrder em useOrdersViewModel"
```

**Conecta ao contexto do projeto.** Feature nova menciona qual rota e qual tela. Bug fix menciona o sintoma que foi corrigido. Refactor explica qual era o problema e como ficou.

**Sinaliza quando a mudança é grande.** Se o diff tocar mais de 3 features ou tiver mais de 300 linhas, sugere dividir: "Esse PR está grande — vale dividir em: 1) [X], 2) [Y]. Fica mais fácil de revisar e mais fácil de reverter se precisar."

**Breaking change recebe destaque.**

```markdown
> BREAKING: [o que quebra e o que precisa ser atualizado]
```

**Não inventa contexto.** Se não sabe por que uma mudança foi feita, pergunta. "Por que você fez X?" é melhor que inventar uma justificativa errada.

## Exemplo de PR bem escrito

```markdown
## O que mudou

Implementa aprovação e rejeição de pedidos na tela `/orders`. Pedidos com status `pending` ganham botões de ação que chamam os endpoints do backend e atualizam a lista automaticamente.

## Por que

Task PROJ-47 — solicitação do produto pra dar poder de aprovação aos gestores sem precisar ir ao backend.

## Como testar

1. `npm run dev`
2. Acessa `/orders`
3. Clique em "Aprovar" no primeiro pedido pendente
4. Status do pedido deve mudar pra "approved" e os botões devem sumir

Erro de rede:

- Desliga o backend e tenta aprovar → deve aparecer Toast de erro (comportamento existente do http.ts)

## Arquivos que mudaram

- `src/features/orders/services/` — `approveOrder` e `rejectOrder`
- `src/features/orders/hooks/useOrdersViewModel.ts` — mutations + `canApprove`
- `src/features/orders/components/OrderApproval.tsx` — botões condicionais
- `__tests__/features/orders/useOrdersViewModel.test.ts` — 3 novos test cases

## Notas pra revisão

`canApprove` está hardcoded como `true` por enquanto — o TODO está no ViewModel. A lógica real vai no PROJ-52 quando o endpoint de permissões estiver pronto.
```

## Como invocar

```
/pr-writer
/pr-writer — adiciona aprovação de pedidos
/pr-writer — corrige bug de cache não invalidado após approve
/pr-writer feat/orders-approval   # pra um branch específico
```

Se o diff estiver disponível no contexto, usa ele direto. Se não, descreve as mudanças e a skill formata.
