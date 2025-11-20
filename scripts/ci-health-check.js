// Simple health check script used by CI to wait for the server to be ready.
// Default URL: http://localhost:3001/api/_health
// Environment variables:
//   HEALTH_URL (optional) - full URL to poll
//   HEALTH_TIMEOUT (optional) - total timeout in milliseconds (default 30000)
// Exits 0 when healthy, exits 1 on timeout.

const url = process.env.HEALTH_URL || 'http://localhost:3001/api/_health';
// Defaults: 120s total wait, poll every 1s. Can be overridden via env vars.
const timeout = parseInt(process.env.HEALTH_TIMEOUT || '120000', 10);
const interval = parseInt(process.env.HEALTH_POLL_INTERVAL || '1000', 10);
const maxAttempts = parseInt(process.env.HEALTH_MAX_ATTEMPTS || '0', 10) || 0; // 0 means unlimited until timeout

async function waitForHealth() {
  const deadline = Date.now() + timeout;
  let attempts = 0;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res && res.ok) {
        console.log(`Health OK: ${url} returned ${res.status} after ${attempts + 1} attempts`);
        return 0;
      }
      console.log(`Health check: ${url} returned ${res ? res.status : 'no response'} (attempt ${attempts + 1})`);
    } catch (err) {
      // network or connection error - keep polling
      // suppress sensitive details
      console.log(`Health check: connection failed (attempt ${attempts + 1})`);
    }
    attempts += 1;
    if (maxAttempts > 0 && attempts >= maxAttempts) {
      console.error(`Health check: reached max attempts ${maxAttempts} without success`);
      break;
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
