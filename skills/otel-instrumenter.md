---
name: otel-instrumenter
description: Adiciona instrumentação OpenTelemetry em Next.js 15 apontando para o GCP Cloud Trace via Grafana Alloy. Trigger em: adiciona OTel, instrumenta essa rota, quero traces no Grafana, configura observabilidade, adiciona spans.
---

# otel-instrumenter

Gera a instrumentação OpenTelemetry para o projeto Next.js 15. Os traces vão pro GCP Cloud Trace via Grafana Alloy — a infra que o projeto já usa.

## instrumentation.ts — na raiz do projeto

Next.js 15 carrega esse arquivo automaticamente no server via `register()`. Não precisa de config extra no `next.config.ts`.

```ts
// instrumentation.ts
import { NodeSDK } from '@opentelemetry/sdk-node'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { Resource } from '@opentelemetry/resources'
import { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_VERSION } from '@opentelemetry/semantic-conventions'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const sdk = new NodeSDK({
      resource: new Resource({
        [SEMRESATTRS_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME ?? 'mvvm-template',
        [SEMRESATTRS_SERVICE_VERSION]: process.env.npm_package_version ?? '0.0.0',
      }),
      traceExporter: new OTLPTraceExporter({
        url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? 'http://localhost:4318/v1/traces',
      }),
      instrumentations: [
        getNodeAutoInstrumentations({
          // fs é muito verboso — desliga
          '@opentelemetry/instrumentation-fs': { enabled: false },
          // http e next já vêm habilitados por padrão
        }),
      ],
    })

    sdk.start()
  }
}
```

O guard `NEXT_RUNTIME === 'nodejs'` é necessário porque Next.js pode chamar `register()` no Edge Runtime também. O SDK Node não funciona no Edge — sem o guard, o boot quebra silenciosamente.

## Variáveis de ambiente — adiciona no .env.local

```bash
OTEL_SERVICE_NAME=mvvm-template
OTEL_EXPORTER_OTLP_ENDPOINT=http://SEU_GRAFANA_ALLOY_URL:4318/v1/traces
```

## Pacotes necessários

```bash
npm install \
  @opentelemetry/sdk-node \
  @opentelemetry/auto-instrumentations-node \
  @opentelemetry/exporter-trace-otlp-http \
  @opentelemetry/resources \
  @opentelemetry/semantic-conventions \
  @opentelemetry/api
```

## Spans customizados — quando o auto-instrumentation não é suficiente

O auto-instrumentation cobre requests HTTP e queries automaticamente. Para spans customizados em partes críticas — por exemplo, medir quanto tempo leva uma aprovação de pedido isolada do resto da request:

```ts
// Em um Route Handler (src/app/api/orders/route.ts)
import { trace, SpanStatusCode } from '@opentelemetry/api'

const tracer = trace.getTracer('orders-service')

export async function GET() {
  return tracer.startActiveSpan('orders.list', async (span) => {
    try {
      const orders = await fetchOrders()

      // atributos customizados — aparecem no Cloud Trace
      span.setAttribute('orders.count', orders.length)
      span.setAttribute('orders.has_pending', orders.some(o => o.status === 'pending'))

      return Response.json(orders)
    } catch (error) {
      span.recordException(error as Error)
      span.setStatus({ code: SpanStatusCode.ERROR })
      throw error
    } finally {
      span.end()  // nunca esquecer o end()
    }
  })
}
```

`span.end()` no `finally` é obrigatório — spans não finalizados não aparecem no Cloud Trace e vazam memória.

## Como o pipeline de traces funciona

```
Next.js app → OTLP HTTP (4318) → Grafana Alloy → GCP Cloud Trace
```

O Grafana Alloy (rodando no Cloud Run) recebe os traces via protocolo OTLP HTTP na porta 4318 e exporta pro GCP Cloud Trace. O dashboard Grafana lê do Cloud Trace via data source configurado. Custo no free tier do GCP é praticamente zero para cargas de desenvolvimento e homologação.

## O que precisa ser configurado fora daqui

**Grafana Alloy no Cloud Run** precisa de um config com OTLP receiver apontando pro Cloud Trace. **OTEL_EXPORTER_OTLP_ENDPOINT** precisa ser definida no `.env.local` (dev) e na configuração do Cloud Run (prod). A service account do GCP precisa da permissão `cloudtrace.traces.patch`.

A skill `/write-docs` pode gerar a documentação completa do setup se precisar.

## Como invocar

```
/otel-instrumenter                           # gera instrumentation.ts + instrução de setup
/otel-instrumenter — adiciona span em GET /api/orders  # adiciona span customizado
/otel-instrumenter — atributo custom no span de aprovação  # adiciona atributo específico
```
