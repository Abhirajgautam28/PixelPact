import { NodeSDK } from '@opentelemetry/sdk-node'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base'
import { Resource } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'

// Support OTLP exporter when OTEL_EXPORTER_OTLP_ENDPOINT is provided.
// Default to ConsoleSpanExporter for local development.
const serviceName = process.env.OTEL_SERVICE_NAME || 'pixelpact-server'

let traceExporter = null
if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
  try {
    // import lazily so package is optional
    const { OTLPTraceExporter } = await import('@opentelemetry/exporter-trace-otlp-http')
    traceExporter = new OTLPTraceExporter({ url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT })
  } catch (e) {
    // fallback to console exporter if OTLP package not installed
    traceExporter = new ConsoleSpanExporter()
    console.warn('OTLP exporter not available, falling back to ConsoleSpanExporter')
  }
} else {
  traceExporter = new ConsoleSpanExporter()
}

const sdk = new NodeSDK({
  resource: new Resource({ [SemanticResourceAttributes.SERVICE_NAME]: serviceName }),
  instrumentations: [getNodeAutoInstrumentations()],
  traceExporter
})

sdk.start().then(()=> console.log('OpenTelemetry SDK started')).catch((e)=> console.warn('otel start failed', e))

process.on('SIGTERM', async () => {
  try { await sdk.shutdown() } catch (e) { /* ignore */ }
  process.exit(0)
})

export default sdk
