/// <reference types="cypress" />

describe('Fluxo de aprovação de pedidos', () => {
  beforeEach(() => {
    cy.visit('/orders')
  })

  it('exibe a lista de pedidos após carregar', () => {
    cy.contains('Pedidos').should('be.visible')
    cy.contains('ORD-001', { timeout: 3000 }).should('be.visible')
  })

  it('abre o modal ao clicar em Aprovar', () => {
    cy.contains('tr', 'ORD-001', { timeout: 3000 })
      .find('button')
      .contains('Aprovar')
      .click()

    cy.get('[role="dialog"]').should('be.visible')
    cy.contains('Aprovar ORD-001').should('be.visible')
  })

  it('valida comentário obrigatório', () => {
    cy.contains('tr', 'ORD-001', { timeout: 3000 })
      .find('button')
      .contains('Aprovar')
      .click()

    cy.get('[role="dialog"]').find('button[type="submit"]').click()
    cy.contains('Comentário obrigatório').should('be.visible')
  })

  it('aprova um pedido com comentário', () => {
    cy.contains('tr', 'ORD-001', { timeout: 3000 })
      .find('button')
      .contains('Aprovar')
      .click()

    cy.get('#comment').type('Aprovado conforme análise comercial.')
    cy.get('[role="dialog"]').find('button[type="submit"]').click()

    cy.get('[role="dialog"]', { timeout: 3000 }).should('not.exist')
    cy.contains('tr', 'ORD-001').contains('Aprovado').should('be.visible')
  })
})
