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

Notes

- This is a homepage scaffold. Integrate with your existing app or use it as a standalone front page.
