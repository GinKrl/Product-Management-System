 Product Management System - PR-01 & PR-02 Completion TODO


**Status**: Plan approved. Executing step-by-step for zero test failures.


## Step 1: Fix test setup (supabase mocks, complete env)
- [ ] Update test/setup.js (complete anon key mock, vi.mock supabase.auth)


## Step 2: Complete auth tests with full flows
- [ ] Fix test/auth/Login.test.jsx (full login flow, error handling)
- [ ] Expand test/auth/Register.test.jsx (form fill → mock email sent note, Google → INACTIVE)
- [ ] Fix test/auth/ProtectedRoute.test.jsx (INACTIVE guard via mock → alert + redirect)


## Step 3: Update docs
- [ ] Update docs/Sprint1-Log.md (add test results)
- [ ] Update README.md (test instructions)


## Step 4: Verify
- [ ] Run `npm test` (confirm 0 failures)
- [ ] Create branches/PRs if gh cli ready


Progress will be updated after each major step.
