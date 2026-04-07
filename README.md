# HOPE Product Management System (PMS)\n\nReact + Vite + Supabase Auth + Tailwind.\n\n## Quick Setup\n1. Clone repo\n2. `cp .env.example .env` & fill VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY\n3. `npm install`\n4. `npm run dev` (http://localhost:5173)\n\n## Testing\n`npm test` (Vitest + RTL)\n`npm run test:ui` (UI mode)\n\n## Features (Sprint 1)\n- Email/Google auth\n- Login guard (INACTIVE block)\n- Protected dashboard\n\nSee [docs/Sprint1-Log.md](docs/Sprint1-Log.md)

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
