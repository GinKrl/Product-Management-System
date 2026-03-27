# ✅ Product Management System — Sprint 1 Setup Guide

This documentation provides the complete setup instructions for running the PMS (Product Management System) locally during **Sprint 1**.  
It covers installation, environment setup, testing, and development workflow.

---

## 🚀 Getting Started

### ✅ 1. Clone the Repository
```bash
git clone https://github.com/<your-org>/<your-repo>.git
cd <your-repo>

📦 Install Dependencies
Install all required packages:

npm install

🔑 Environment Variables

Create a .env file in the project root and add the variables below:

VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>

▶️ Start the Development Server
To run the local development server:

npm run dev

This will launch Vite and serve the React app on:

http://localhost:5173

🧪 Testing (Vitest + React Testing Library)

Sprint 1 requires automated tests for the authentication flow.

✅ Run All Tests

npm run test

Vitest is fully configured with:

jsdom environment
setup file (vitest.setup.js)
React Testing Library
Watch mode for auto‑reruns

All test files are inside:
/src/tests/

📚 Technologies Used in Sprint 1

React + Vite — Frontend framework & dev environment
TailwindCSS — Styling
Supabase — Auth & Database
Vitest — Testing framework
React Testing Library — Component testing
ESLint — Code linting

📄 Documentation Files
Location of Sprint documentation:
docs/sprint1-log.md

Contains:

Completed Sprint 1 tasks
Blockers & resolutions
Notes for Sprint 2 QA tasks


✅ Sprint 1 Deliverables Included
This repository contains the required Sprint 1 outputs for M5: QA / Documentation:

✅ Vitest installation & configuration
✅ Auth test placeholders (Email, Google OAuth, Login Guard)
✅ Sprint 1 Log
✅ Updated README.md setup guide


👩‍💻 Developer Notes
This repo follows the project-wide Git workflow:
feature/branch → Pull Request → dev → release → main

✅ Never commit directly to main or dev.
✅ All work must go through a properly named feature/test/docs branch.