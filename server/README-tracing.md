Tracing (OpenTelemetry)
=======================

This project includes a minimal OpenTelemetry initializer at `server/tracing.js`.

Local behavior
--------------

- By default the initializer uses a `ConsoleSpanExporter` which prints spans to server stdout.

- To enable OTLP HTTP export to a collector (e.g. `http://localhost:4318`), set the environment variable:

  - `OTEL_EXPORTER_OTLP_ENDPOINT=http://collector-host:4318/v1/traces`

When `OTEL_EXPORTER_OTLP_ENDPOINT` is set and the `@opentelemetry/exporter-trace-otlp-http` package is installed, the SDK will use that exporter.

Usage
-----

Start the server as usual. If you want to see spans in console (dev) just run:

```powershell
node server/index.js
```

To export to an OTLP collector, install an OTLP collector and set `OTEL_EXPORTER_OTLP_ENDPOINT` before starting the server.

Notes
-----

- This initializer uses auto-instrumentation to capture HTTP/Express and other common libraries. For production use, replace the `ConsoleSpanExporter` with a production-ready exporter and configure batching and resource attributes appropriately.
