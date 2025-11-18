import { NodeSDK } from '@opentelemetry/sdk-node'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base'
let Resource = null
let SemanticResourceAttributes = null
try{ Resource = require('@opentelemetry/resources').Resource }catch(e){ Resource = null }
try{ SemanticResourceAttributes = require('@opentelemetry/semantic-conventions').SemanticResourceAttributes }catch(e){ SemanticResourceAttributes = null }

// Optional OTLP exporter (HTTP). If OTEL_EXPORTER_OTLP_ENDPOINT is provided,
// we will use the OTLP HTTP exporter; otherwise fall back to console exporter.
let OtelExporter = null
try{
  OtelExporter = require('@opentelemetry/exporter-trace-otlp-http').OTLPTraceExporter
}catch(e){ OtelExporter = null }

const serviceName = process.env.OTEL_SERVICE_NAME || 'pixelpact-server'

function createExporter(){
  const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || null
  if (endpoint && OtelExporter){
    return new OtelExporter({ url: endpoint })
  }
  return new ConsoleSpanExporter()
}

const resourceObj = Resource ? new Resource({ [(SemanticResourceAttributes && SemanticResourceAttributes.SERVICE_NAME) || 'service.name']: serviceName }) : undefined

const sdk = new NodeSDK({
  resource: resourceObj,
  instrumentations: [getNodeAutoInstrumentations()],
  traceExporter: createExporter()
})

// Start the SDK if available. NodeSDK.start may or may not return a Promise
// depending on the installed @opentelemetry/sdk-node version — handle both cases.
try{
  const startResult = sdk && typeof sdk.start === 'function' ? sdk.start() : null
  if (startResult && typeof startResult.catch === 'function') {
    startResult.catch(()=>{})
  }
}catch(e){
  // swallow startup errors — tracing should not crash the app
}

process.on('SIGTERM', async () => {
  try {
    if (sdk && typeof sdk.shutdown === 'function') {
      const shutdownResult = sdk.shutdown()
      if (shutdownResult && typeof shutdownResult.catch === 'function') {
        await shutdownResult.catch(()=>{})
      }
    }
  } catch (e) { /* ignore */ }
  process.exit(0)
})

export default sdk
