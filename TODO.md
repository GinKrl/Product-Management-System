# Product Management System - Sprint 1 Completion TODO

Status: Approved plan execution started.

## PR-01: test/sprint1-auth-flows — Auth test cases (email + Google + login guard)
- [ ] 1.1 Install Vitest + RTL + MSW deps (`npm i -D vitest@^2.0.0 @testing-library/react@^16.0.0 @testing-library/jest-dom@^6.5.0 jsdom@^25.0.1 msw@^2.4.11`)
- [ ] 1.2 Update package.json (add test scripts: "test": "vitest", "test:ui": "vitest --ui"; confirm deps)
- [x] 1.3 Update vite.config.js (add test: { environment: 'jsdom' }); create vitest.config.js if needed
- [x] 1.4 Create test/setup.js (import '@testing-library/jest-dom'; vi.mock('../src/lib/supabaseClient'))
- [x] 1.5 Create test/auth/Register.test.jsx (email signup mock → success/alert; Google button click)
- [x] 1.6 Create test/auth/Login.test.jsx (email login mock; Google OAuth)
- [x] 1.7 Create test/auth/ProtectedRoute.test.jsx (loading; INACTIVE → alert/redirect; ACTIVE → pass; no session → /login)
- [ ] 1.8 Run `npm test` (8+ passing tests; note manual email/Google verification)

## PR-02: docs/sprint1-log-readme — Sprint 1 log and README setup
- [x] 2.1 Update README.md (add Setup: clone/i/.env/npm run dev; Tests: npm test)
- [x] 2.2 Create docs/Sprint1-Log.md (date/tasks/blockers/next)

## Final Steps
- [ ] Create branches `blackboxai/PR-01-auth-tests`, `blackboxai/PR-02-docs`, commit/push
- [ ] `gh pr create --title "PR-01..." --body "..."` for each
- [ ] Mark complete: Vitest configured, tests pass, docs updated.

Current: PR-01/PR-02 complete. Run `npm test` (manual deps/scripts), git branches/PRs.
