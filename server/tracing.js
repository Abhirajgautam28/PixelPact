import { NodeSDK } from '@opentelemetry/sdk-node'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { Resource } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'

// Minimal OpenTelemetry Node SDK initialization. This file is safe to import
// early in the server startup to enable automatic instrumentation for HTTP,
// Express, and other core modules.
const serviceName = process.env.OTEL_SERVICE_NAME || 'pixelpact-server'

const sdk = new NodeSDK({
  resource: new Resource({ [SemanticResourceAttributes.SERVICE_NAME]: serviceName }),
  instrumentations: [getNodeAutoInstrumentations()],
  traceExporter: new ConsoleSpanExporter()
})

sdk.start()

process.on('SIGTERM', async () => {
  try { await sdk.shutdown() } catch (e) { /* ignore */ }
  process.exit(0)
})

export default sdk
