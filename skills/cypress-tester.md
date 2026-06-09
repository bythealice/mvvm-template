---
name: cypress-tester
description: Gera testes Vitest para o ViewModel e testes Cypress E2E para os fluxos críticos de uma feature. Trigger em: gera testes pra X, escreve os testes de Y, cobre essa feature, adiciona E2E pra Z, preciso de coverage no ViewModel.
---

# cypress-tester

Gera os testes de uma feature — Vitest pro ViewModel (lógica pura, milissegundos, sem browser) e Cypress E2E pros fluxos que o usuário real executa (do clique ao resultado, sem mock da UI).

## Lê antes de gerar

1. **Abre `__tests__/features/orders/useOrdersViewModel.test.ts`** — referência de padrão Vitest.
2. **Abre `cypress/e2e/orders.cy.ts`** — referência de padrão E2E.
3. **Abre `__tests__/helpers/test-wrapper.tsx`** — wrapper do QueryClient.
4. **Verifica os `data-testid`** na View da feature — seleciona por eles nos E2E, nunca por classe CSS.

Se a feature não tiver `data-testid` nos elementos interativos, aponta isso antes de gerar os testes. Sem `data-testid`, os seletores E2E quebram na primeira mudança de markup.

## Vitest — ViewModel isolado

O ViewModel é um hook puro: recebe chamadas de serviço, retorna estado. Testa isolado, mockando os services. Não monta nenhuma tela.

```ts
// __tests__/features/[nome]/use[Nome]ViewModel.test.ts
import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { use[Nome]ViewModel } from '@/features/[nome]/hooks/use[Nome]ViewModel'
import * as [nome]Service from '@/features/[nome]/services/[nome].service'
import { createWrapper } from '../../helpers/test-wrapper'
import type { [Nome] } from '@/features/[nome]/types/[nome].types'

// fixture de dados — representa o retorno tipado da API
const mock[Nomes]: [Nome][] = [
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    // ... campos da feature
  },
]

vi.mock('@/features/[nome]/services/[nome].service')

describe('use[Nome]ViewModel', () => {
  beforeEach(() => {
    vi.mocked([nome]Service.fetch[Nomes]).mockResolvedValue(mock[Nomes])
  })

  it('inicia em estado de loading', () => {
    const { result } = renderHook(() => use[Nome]ViewModel(), {
      wrapper: createWrapper(),
    })
    expect(result.current.isLoading).toBe(true)
  })

  it('carrega os dados após a query resolver', async () => {
    const { result } = renderHook(() => use[Nome]ViewModel(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.[items]).toHaveLength(1)
    expect(result.current.[items][0].id).toBe(mock[Nomes][0].id)
  })

  it('expõe can[Acao] como booleano', async () => {
    const { result } = renderHook(() => use[Nome]ViewModel(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // a View não verifica role — só esse booleano
    expect(typeof result.current.can[Acao]).toBe('boolean')
  })

  it('chama [acao][Nome] com o id correto ao executar on[Acao]', async () => {
    vi.mocked([nome]Service.[acao][Nome]).mockResolvedValue(undefined)

    const { result } = renderHook(() => use[Nome]ViewModel(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      result.current.on[Acao](mock[Nomes][0].id)
    })

    expect([nome]Service.[acao][Nome]).toHaveBeenCalledWith(mock[Nomes][0].id)
    expect([nome]Service.[acao][Nome]).toHaveBeenCalledTimes(1)
  })

  it('expõe error quando a query falha', async () => {
    const mockError = new Error('Erro de rede')
    vi.mocked([nome]Service.fetch[Nomes]).mockRejectedValue(mockError)

    const { result } = renderHook(() => use[Nome]ViewModel(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBeDefined()
  })
})
```

### Regras do Vitest

Um `it` por comportamento — não junta vários asserts em "deve funcionar tudo". Nome do teste descreve o comportamento, não o código: "carrega os dados após a query resolver" em vez de "fetchProducts é chamado". Mock do service inteiro com `vi.mock()` — nunca mock parcial. `createWrapper()` em todo `renderHook` — o QueryClient precisa do Provider. Não testa a UI — se quer ver se o botão aparece, usa Cypress.

## Cypress E2E — fluxos críticos

Testa do clique ao resultado. App rodando, sem mock do React, mock só do HTTP via `cy.intercept`.

```ts
// cypress/e2e/[nome].cy.ts
describe('[Feature] — [descrição do fluxo]', () => {
  beforeEach(() => {
    // intercepta e retorna fixture — controla o estado sem depender do backend
    cy.intercept('GET', '/api/[resource]/', { fixture: '[resource].json' }).as('get[Resource]')
    cy.visit('/[rota]')
    cy.wait('@get[Resource]')  // espera o dado carregar antes de cada teste
  })

  it('exibe os items após carregar', () => {
    cy.get('[data-testid="[item]-item"]').should('have.length.at.least', 1)
  })

  it('mostra os botões de ação pra items no estado correto', () => {
    cy.get('[data-testid="btn-[acao]"]').first().should('be.visible')
    cy.get('[data-testid="btn-[acao]"]').first().should('not.be.disabled')
  })

  it('executa a ação principal e atualiza a UI', () => {
    cy.intercept('POST', '/api/[resource]/*/[acao]/', {
      statusCode: 200,
    }).as('[acao][Resource]')

    // estado após a ação — pode ser uma fixture diferente
    cy.intercept('GET', '/api/[resource]/', {
      fixture: '[resource]-after-[acao].json',
    }).as('refresh[Resource]')

    cy.get('[data-testid="btn-[acao]"]').first().click()

    // espera a mutation completar
    cy.wait('@[acao][Resource]')
    // espera o refetch automático do TanStack Query
    cy.wait('@refresh[Resource]')

    // verifica o estado na UI
    cy.get('[data-testid="[item]-status"]').first().should('contain', '[novo-status]')
  })

  it('desabilita botões durante a mutation', () => {
    cy.intercept('POST', '/api/[resource]/*/[acao]/', (req) => {
      req.reply({ delay: 300, statusCode: 200 })  // adiciona delay pra capturar o estado
    }).as('slow[Acao]')

    cy.get('[data-testid="btn-[acao]"]').first().click()

    // durante o pending — botão deve estar desabilitado
    cy.get('[data-testid="btn-[acao]"]').first().should('be.disabled')

    cy.wait('@slow[Acao]')
  })

  it('exibe mensagem quando a lista está vazia', () => {
    cy.intercept('GET', '/api/[resource]/', { body: [] }).as('empty')
    cy.visit('/[rota]')
    cy.wait('@empty')

    cy.get('[data-testid="[item]-item"]').should('not.exist')
    cy.contains('Nenhum').should('be.visible')  // ou o texto real da mensagem
  })
})
```

### Fixtures necessárias

Gera junto com os testes:

```json
// cypress/fixtures/[resource].json — estado inicial
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "[campo]": "[valor]",
    "status": "[status-inicial]"
  }
]

// cypress/fixtures/[resource]-after-[acao].json — estado após a ação
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "[campo]": "[valor]",
    "status": "[novo-status]"
  }
]
```

### Regras do Cypress

Seleciona por `data-testid` — nunca por classe CSS, texto, ou estrutura do DOM. `cy.intercept` antes do `cy.visit` — intercepta desde o primeiro request. `cy.wait('@alias')` pra sincronizar — não usa `cy.wait(1000)` com número fixo. Fixture pra cada estado que precisar testar — não tenta simular estado via UI. Cada `it` testa um fluxo completo — começa no `beforeEach` e termina num assert claro.

## O que não testar

| O que é tentador testar | Por que não |
|------------------------|-------------|
| Cada prop do componente individualmente | É snapshot test — TypeScript já garante isso |
| Implementação interna do hook | Testa comportamento — se refatorar sem mudar o comportamento, o teste não pode quebrar |
| Estilo visual (cor, tamanho de fonte) | CSS não é responsabilidade do teste funcional |
| Chamadas de rede na View | A View não faz chamadas — o ViewModel faz, e o Vitest cobre isso |

## Como invocar

```
/cypress-tester orders                  # gera Vitest + Cypress E2E completos
/cypress-tester products vitest         # só Vitest pro ViewModel
/cypress-tester users e2e               # só testes E2E
/cypress-tester orders — só aprovação   # só o fluxo de aprovação
```
