---
name: code-explainer
description: Explica código que o dev não escreveu, no contexto da arquitetura MVVM by-feature do projeto. Não é só "esse código faz X" — é "esse é o ViewModel, fica aqui porque Y, se comunica com Z assim". Trigger em: me explica esse código, o que isso faz, por que isso tá aqui, não entendo esse arquivo, o que é esse hook.
---

# code-explainer

Explica código no contexto do projeto — qual layer é, por que está organizado assim, o que se conecta com o quê. O dev sai entendendo o código de verdade, não só decorando a sintaxe.

## O que cobre em cada explicação

Identifica a layer (View, ViewModel, Model, Core, Shared, App) e explica por que esse arquivo existe nessa arquitetura. Explica o que o código faz em português claro. Mapeia as conexões: quem chama isso, o que isso chama, qual é o fluxo completo. Aponta o que pode confundir — padrão não-óbvio, decisão técnica, nome enganoso.

## Exemplos de como explica

### Para `useOrdersViewModel.ts`

```
Esse é o ViewModel da feature orders — fica entre a tela (View) e as chamadas
de API (Model/services). É aqui que toda a lógica de negócio e orquestração fica.

O que ele faz:

1. Busca a lista de pedidos via useQuery → chama fetchOrders do service
   Query key: ['orders'] — se você invalidar com essa key de qualquer lugar,
   os dados são refetched automaticamente.

2. staleTime: 1000 * 60 * 2 é uma decisão consciente: os pedidos não mudam
   tão rápido que precisam ser rebuscados a cada foco de janela. 2 minutos é
   suficiente pro fluxo de aprovação.

3. Dois useMutation — approve e reject. O onSuccess invalida a query key
   ['orders'], o que dispara um refetch automático da lista.

4. canApprove: true está hardcoded por enquanto — o TODO indica que vai vir
   do contexto de auth quando PROJ-52 estiver pronto.

O que a View recebe:
- orders: lista de pedidos tipados
- isLoading: estado de carregamento (View mostra skeleton/spinner)
- canApprove: booleano — View nunca verifica user.role diretamente
- onApprove / onReject: handlers prontos — View só chama, não decide

Quem usa isso?
OrderApproval.tsx chama useOrdersViewModel() direto. Só esse arquivo.
```

### Para `http.ts`

```
Esse é o cliente HTTP do projeto — uma instância Axios configurada uma vez
e usada em todos os services.

Por que Axios e não fetch?
Axios tem interceptors — código que roda em toda request/response sem
precisar repetir em cada chamada. Aqui tem dois:

1. Request interceptor: pega o token do localStorage e adiciona no header
   Authorization. Toda chamada autenticada funciona automaticamente.

2. Response interceptor: se receber 401, loga um aviso. Você pode adicionar
   redirect pro login aqui quando a autenticação estiver integrada.

baseURL vem de NEXT_PUBLIC_API_URL no .env.local. Em dev aponta pra
localhost:8000, em prod aponta pra API de produção.

timeout: 10_000 — se o servidor demorar mais de 10 segundos, a request
falha com erro de timeout. O Zod no service vai pegar esse erro e propagar
pro useQuery, que expõe via `error`.
```

### Para `createWrapper()` nos testes

```
Esse helper existe por causa de como o TanStack Query funciona — ele precisa
de um QueryClientProvider no contexto pra funcionar.

Em testes com renderHook, você não tem um componente pai com o Provider.
createWrapper() cria um componente React que envolve o hook com o Provider,
com um QueryClient limpo (retry: false, staleTime: 0) pra cada teste.

Por que retry: false?
Com retry padrão, se o mock rejeitar a promise, o TanStack Query vai tentar
de novo 3 vezes antes de reportar o erro. Isso torna os testes lentos e
imprevisíveis. retry: false faz o erro aparecer imediatamente.

Por que staleTime: 0?
Pra garantir que em cada teste os dados sejam sempre buscados de novo,
sem cache entre testes.
```

## Como invocar

```
/code-explainer src/features/orders/hooks/useOrdersViewModel.ts
/code-explainer src/core/api/http.ts
/code-explainer __tests__/helpers/test-wrapper.tsx
/code-explainer — o que esse useEffect está fazendo?
/code-explainer — por que tem staleTime aqui?
/code-explainer — o que é esse z.infer<typeof OrderSchema>?
```

Cola o trecho de código quando for algo específico. Para um arquivo inteiro, só o caminho já basta.
