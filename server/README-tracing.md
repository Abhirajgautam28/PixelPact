# Tracing (OpenTelemetry)

This project includes a minimal OpenTelemetry initializer at `server/tracing.js`.

Behavior:
- By default, traces are exported to the console using `ConsoleSpanExporter` (suitable for local development).
- To export to an OTLP collector set the environment variable `OTEL_EXPORTER_OTLP_ENDPOINT` to the collector HTTP endpoint (e.g. `http://localhost:4318/v1/traces`) and install the OTLP exporter dependency.

Quick setup (OTLP):

1. Install OTLP exporter package:

```powershell
npm install @opentelemetry/exporter-trace-otlp-http --save
```

2. Start the server with the collector endpoint configured:

```powershell
$env:OTEL_EXPORTER_OTLP_ENDPOINT = 'http://localhost:4318/v1/traces'
node server/index.js
```

Notes:
- `tracing.js` lazy-loads the OTLP exporter so it is optional; if the exporter package is not installed the code falls back to console exporter.
- For production, swap the exporter and configure appropriate batching and credentials.
