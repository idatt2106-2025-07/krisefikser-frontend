# Krisefikser Frontend

A Vue 3 + Vite frontend for the Krisefikser crisis-management system.  
Features include user registration (with hCaptcha), login, and protected routes.

---

## Reports

[![Coverage](https://img.shields.io/badge/Test_coverage-green)](https://idatt2106-2025-07.github.io/krisefikser-frontend/)

---

## Prerequisites

- Node.js ≥ 18
- npm (or pnpm / yarn)
- A running backend on http://localhost:8080

---

## Quickstart

1. Clone the repo
   ```bash
   git clone git@…:krisefikser-frontend.git
   cd krisefikser-frontend
   ```
2. Install dependencies
   ```bash
   npm install
   ```
3. Add your backend hostname to `/etc/hosts`
   ```bash
   make setup-hosts
   ```
4. Start the development server
   ```bash
   npm dev
   ```
   ➜ Your app is served at https://dev.krisefikser.localhost:5173

---

## Environment Variables

Create a `.env` file in the project root to override defaults:

```env
VITE_HCAPTCHA_SITEKEY=your-sitekey
VITE_API_BASE_URL=/api
```

> All `/api` requests are proxied to `http://localhost:8080` via `vite.config.ts`.

---

## Available Scripts

| Command            | Description                      |
| ------------------ | -------------------------------- |
| `npm dev`          | Start dev server                 |
| `npm build`        | Build for production             |
| `npm preview`      | Preview production build         |
| `npm lint`         | Lint & fix files (ESLint)        |
| `npm format`       | Format code (Prettier)           |
| `npm test:unit`    | Run unit tests (Vitest)          |
| `npm test:e2e`     | Run headless Cypress e2e tests   |
| `npm test:e2e:dev` | Open Cypress in interactive mode |

---

## Testing

1. **Unit tests**
   ```bash
   npm test:unit
   ```
2. **E2E tests**
   - Run preview server:
     ```bash
     npm preview
     ```
   - In another shell:
     ```bash
     npm test:e2e
     ```
   - For interactive mode:
     ```bash
     npm test:e2e:dev
     ```

---

## Project Structure

```
src/
 ├── assets/
 ├── components/
 ├── views/
 │   └── auth/
 │       └── RegisterView.vue   ← registration + hCaptcha
 ├── router/
 ├── store/
 ├── main.ts
public/
cypress/                      ← e2e tests
tests/                        ← unit tests
Makefile                      ← helper targets
vite.config.ts
```

---

## Contributing

1. Fork & clone
2. Create a feature branch
3. Commit, lint, and test
4. Open a merge request

Please follow code style, add tests for new features, and update docs as needed.

---

## License

[MIT](LICENSE)
