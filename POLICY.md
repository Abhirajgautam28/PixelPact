# /policy.json contract

This file documents the machine-readable policy metadata served at `/policy.json`.

- Content-Type: `application/json`
- Read: `GET /policy.json` — Returns a JSON object with the following (recommended) shape:

```json
{
  "updatedAt": "YYYY-MM-DD",
  "privacy": { "effective": "YYYY-MM-DD", "path": "/privacy" },
  "terms": { "effective": "YYYY-MM-DD", "path": "/terms" },
  "changelog": [ { "date": "YYYY-MM-DD", "title": "string", "details": "string (optional)" } ],
  "source": "/privacy"
}
# /policy.json contract

This file documents the machine-readable policy metadata served at `/policy.json`.

Content-Type: `application/json`

Read: `GET /policy.json` — Returns a JSON object with the following (recommended) shape:

```json
{
  "updatedAt": "YYYY-MM-DD",
  "privacy": { "effective": "YYYY-MM-DD", "path": "/privacy" },
  "terms": { "effective": "YYYY-MM-DD", "path": "/terms" },
  "changelog": [ { "date": "YYYY-MM-DD", "title": "string", "details": "string (optional)" } ],
  "source": "/privacy"
}
```

Admin write: `POST /api/admin/policy` — Protected endpoint. Requires admin authentication. Accepts the JSON body above and atomically writes `server/policy.json`.

Admin check: `GET /api/admin/me` — Returns `200` with `{ "admin": true }` when the request is authenticated as admin; otherwise `401`.

Notes:

- The server exposes a default policy if `server/policy.json` is missing.
- Integrators can use `/policy.json` to programmatically check policy effective dates and changelogs.
- If you want the policy to be updated programmatically, call the admin write endpoint with appropriate admin credentials.
