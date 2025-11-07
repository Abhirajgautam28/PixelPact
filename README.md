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

   - This project uses Vitest with a JSDOM environment. To avoid intermittent worker IPC issues on some Windows/Node setups, the default test script runs Vitest with a single worker:

     ```powershell
     npm test
     # (runs `vitest src/__tests__ --run --threads=1`)
     ```

   - The test harness includes lightweight stubs for Canvas and IntersectionObserver so tests run reliably without native canvas packages.

Files added

- `package.json`, Vite config, Tailwind & PostCSS configs
- `src/` React app with components (`Nav`, `Hero`, `Features`, `Footer`)

Notes

- This is a homepage scaffold. Integrate with your existing app or use it as a standalone front page.
