/// <reference types="cypress" />
import { useOrdersViewModel } from '../../src/features/orders/hooks/useOrdersViewModel'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

function Harness() {
  const vm = useOrdersViewModel()
  return (
    <div>
      <span data-testid="loading">{String(vm.isLoading)}</span>
      <span data-testid="count">{vm.orders.length}</span>
      <span data-testid="pending">{vm.pendingCount}</span>
      <span data-testid="can-approve">{String(vm.canApprove)}</span>
    </div>
  )
}

function wrap(ui: React.ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{ui}</QueryClientProvider>
}

describe('useOrdersViewModel', () => {
  it('inicia em loading e carrega os pedidos', () => {
    cy.mount(wrap(<Harness />))
    cy.get('[data-testid="loading"]').should('contain', 'true')
    cy.get('[data-testid="count"]', { timeout: 3000 }).should('not.contain', '0')
  })

  it('expõe pendingCount corretamente', () => {
    cy.mount(wrap(<Harness />))
    cy.get('[data-testid="pending"]', { timeout: 3000 }).should('not.be.empty')
  })

  it('canApprove é true para role manager (default do store)', () => {
    cy.mount(wrap(<Harness />))
    cy.get('[data-testid="can-approve"]').should('contain', 'true')
  })
})
