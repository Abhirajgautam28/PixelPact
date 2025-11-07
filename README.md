# PixelPact

This repo now contains a Vite + React + TailwindCSS homepage scaffold for PixelPact (a multi-user collaborative whiteboard).

Local development

1. Install dependencies:

   npm install

2. Start dev server:

   npm run dev

The dev server will run on [http://localhost:5173](http://localhost:5173) by default.

Admin testimonials (managing site testimonials)

1. Admin token

   - The server accepts a simple admin token via the `ADMIN_TOKEN` environment variable. If not provided, a safe development default is used:

     - Default (dev): `dev-admin-token`

   - To use admin endpoints or the admin UI, set the environment variable before starting the server, for example (PowerShell):

     ```powershell
     $env:ADMIN_TOKEN = 'your-secret-token'; npm run start:server
     ```

2. Admin UI

   - A lightweight admin UI is available at `/admin/testimonials` in the app. It allows listing, adding, editing and deleting testimonials.

3. CLI alternative

   - A small CLI is provided at `scripts/manage-testimonials.js` and is exposed via the `manage-testimonials` bin in `package.json`.
     Example: `node scripts/manage-testimonials.js list`

4. Tests and stability

    - This project uses Vitest with a JSDOM environment. Tests are run with a small Node wrapper that preloads a test-preload to silence noisy runtime warnings (React Router future-flag and jsdom canvas messages). Run tests with:

       ```powershell
       npm test
       # (runs the cross-platform test wrapper at scripts/run-tests.js)
       ```

    - The test harness includes lightweight stubs for Canvas and IntersectionObserver so tests run reliably without native canvas packages.

5. Example admin API usage (curl)

    - List testimonials:

       ```bash
       curl -s http://localhost:3001/api/testimonials | jq
       ```

    - Add a testimonial (requires ADMIN_TOKEN):

       ```bash
       curl -X POST http://localhost:3001/api/testimonials \
          -H "Authorization: dev-admin-token" \
          -H "Content-Type: application/json" \
          -d '{"name":"Jane Doe","role":"Designer","text":"Great product!"}' | jq
       ```

    - Update a testimonial (index 0):

       ```bash
       curl -X PUT http://localhost:3001/api/testimonials/0 \
          -H "Authorization: dev-admin-token" \
          -H "Content-Type: application/json" \
          -d '{"name":"Jane Updated","text":"Updated text"}' | jq
       ```

    - Delete a testimonial (index 0):

       ```bash
       curl -X DELETE http://localhost:3001/api/testimonials/0 -H "Authorization: dev-admin-token"
       ```

      - Admin login (exchange ADMIN_PASSWORD for a JWT):

          ```bash
          curl -X POST http://localhost:3001/api/admin/login \
             -H "Content-Type: application/json" \
             -d '{"password":"dev-password"}' | jq
          # returns { "token": "<jwt>" }
          ```

6. CI recommendation

    - In CI, call the cross-platform test wrapper:

       ```bash
       node scripts/run-tests.js
       ```

7. Example environment file

   Copy `.env.example` to `.env` and edit values for production. Example keys:

   - `ADMIN_TOKEN` (legacy, optional)
   - `ADMIN_PASSWORD` (used by `/api/admin/login` to issue a JWT)
   - `ADMIN_JWT_SECRET` (JWT signing secret for admin tokens)

   See `.env.example` in the project root.

8. GitHub Actions CI sample

   Below is a minimal GitHub Actions workflow you can place in `.github/workflows/ci.yml` to run tests:

   ```yaml
   name: CI

   on: [push, pull_request]

   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - name: Use Node.js
           uses: actions/setup-node@v4
           with:
             node-version: '18'
         - name: Install dependencies
           run: npm ci
         - name: Run tests
           env:
             ADMIN_PASSWORD: ${{ secrets.ADMIN_PASSWORD }}
             ADMIN_JWT_SECRET: ${{ secrets.ADMIN_JWT_SECRET }}
           run: node scripts/run-tests.js
   ```

Files added

- `package.json`, Vite config, Tailwind & PostCSS configs
- `src/` React app with components (`Nav`, `Hero`, `Features`, `Footer`)

Developer utilities

- `scripts/generate-admin-token.js` — convenience script to mint a signed admin JWT for local development. It signs the payload { role: 'admin' } using the `ADMIN_JWT_SECRET` (or `JWT_SECRET`) environment variable. Usage:

   ```bash
   # default: reads ADMIN_JWT_SECRET or falls back to 'dev-jwt-secret'
   node scripts/generate-admin-token.js

   # custom secret / expiry
   node scripts/generate-admin-token.js --secret mysecret --expires 30d
   ```

- `scripts/manage-testimonials.js` supports optional remote mode (call the running server) via `--server`. In remote mode you can provide `--password` to exchange for a JWT via `/api/admin/login` or `--token` to pass an existing token. Examples:

   ```bash
   # Add testimonial locally (edits server/testimonials.json):
   node scripts/manage-testimonials.js add --name "Jane" --role "CEO" --text "Great product"

   # Add testimonial remotely using admin password:
   node scripts/manage-testimonials.js add --server http://localhost:3001 --password dev-password --name "Jane" --role "CEO" --text "Great product"

   # Add testimonial remotely using a pre-generated token:
   node scripts/manage-testimonials.js add --server http://localhost:3001 --token "Bearer <your-token>" --name "Jane" --role "CEO" --text "Great product"
   ```

Note: remote mode uses the global `fetch`. On older Node versions the CLI will attempt to import `node-fetch` dynamically; install it with `npm i -D node-fetch` if needed.

Notes

- This is a homepage scaffold. Integrate with your existing app or use it as a standalone front page.

## Admin UI opt-in (Vite)

The in-browser admin UI (testimonials manager) is intentionally hidden in production by default.

To enable the admin UI in a production build you can opt-in using a Vite environment variable:

- In development the admin UI is shown automatically.
- In production, enable it explicitly by setting `VITE_ENABLE_ADMIN=true` before building.

PowerShell example (build with admin UI enabled):

```powershell
$env:VITE_ENABLE_ADMIN = 'true'; npm run build
```

Or when running the preview server after building:

```powershell
$env:VITE_ENABLE_ADMIN = 'true'; npm run preview
```

Security note: enabling the admin UI on production exposes a client-side management UI — ensure your server-side admin authentication (JWT or ADMIN_TOKEN and ADMIN_JWT_SECRET) is strongly protected and never commit production secrets to the repo. For production workflows we recommend managing testimonials via a secure server-side admin dashboard or CI-driven content pipeline rather than exposing an in-browser admin unless you understand the risk and have strong auth controls in place.
