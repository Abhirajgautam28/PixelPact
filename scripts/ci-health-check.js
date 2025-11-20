// Simple health check script used by CI to wait for the server to be ready.
// Default URL: http://localhost:3001/api/_health
// Environment variables:
//   HEALTH_URL (optional) - full URL to poll
//   HEALTH_TIMEOUT (optional) - total timeout in milliseconds (default 30000)
// Exits 0 when healthy, exits 1 on timeout.

const url = process.env.HEALTH_URL || 'http://localhost:3001/api/_health';
const timeout = parseInt(process.env.HEALTH_TIMEOUT || '30000', 10);
const interval = parseInt(process.env.HEALTH_POLL_INTERVAL || '1000', 10);

async function waitForHealth() {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res && res.ok) {
        console.log(`Health OK: ${url} returned ${res.status}`);
        return 0;
      }
      console.log(`Health check: ${url} returned ${res ? res.status : 'no response'}`);
    } catch (err) {
      // network or connection error - keep polling
      // suppress sensitive details
      console.log(`Health check: connection failed (${err && err.message ? err.message : 'error'})`);
    }
    await new Promise((r) => setTimeout(r, interval));
  }
  console.error(`Health check timed out after ${timeout}ms waiting for ${url}`);
  return 1;
}

(async () => {
  try {
    const code = await waitForHealth();
    process.exit(code);
  } catch (err) {
    console.error('Health check script error:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
