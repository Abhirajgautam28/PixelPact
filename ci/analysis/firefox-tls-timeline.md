# Firefox CI: Playwright Failure vs Server TLS log timeline

Playwright failure timestamp (from `ci-firefox.log`):

- 2025-11-20T08:53:42.715Z — TimeoutError waiting for selector `#home-hero` in Firefox (20s default)

Extracted server `server-firefox.log` entries (relevant `tls.connect` / OpenSSL alert lines):

- traceId: `6cb6f91e9435a2432aadf1a48653d671`
  - name: `tls.connect`
  - timestamp: `1763627390438000`
  - status.message: "...SSL routines:ssl3_read_bytes:tlsv1 alert internal error... SSL alert number 80"

- traceId: `6ae5054d5b92e560b2ef8b07fa802c27`
  - name: `tls.connect`
  - timestamp: `1763627390443000`
  - status.message: "...SSL routines:ssl3_read_bytes:tlsv1 alert internal error... SSL alert number 80"

- traceId: `79ae8f91fc9cfa9de99b90d962c292ef`
  - name: `tls.connect`
  - timestamp: `1763627390444000`
  - status.message: "...SSL routines:ssl3_read_bytes:tlsv1 alert internal error... SSL alert number 80"

Additional repeated `tls.connect` alerts with the same OpenSSL message are present throughout the log during the Playwright run window. The server also recorded successful `tcp.connect` and `dns.lookup` events for the MongoDB hosts, indicating network-level reachability but TLS handshake failures.

Conclusion / recommendation:

- The Playwright timeout and server TLS alerts overlap in the same CI run window. That suggests the server was experiencing TLS handshake/internal errors when attempting to reach the configured MongoDB Atlas hosts, which could cause server-side errors or delays impacting frontend rendering and causing Playwright to time out.
- Short-term mitigation (already applied): the Playwright matrix job now forces `MONGO_URI`/`MONGODB_URI` empty so the server uses the in-memory fallback during matrix runs. This should remove Atlas/TLS as a source of flakiness for matrix Playwright jobs.
- Next steps: re-run CI (already triggered). If CI still fails, inspect the new run artifacts and the server log uploaded for the firefox matrix job; if TLS errors persist even with empty `MONGO_URI`, investigate whether other outgoing TLS calls exist (third-party APIs) or whether the server process is restarting.

Files referenced:

- `ci-artifacts-rerun/server-log-firefox/server-firefox.log`
- `ci-firefox.log`
