# HopePMS — Sprint 2 Log

**Branch:** `docs/sprint2-log` | **PR:** PR-07

**Sprint Theme:** Role-Based Access Control, Soft Delete & Audit Visibility

**Dates:** Week 3–4 | Sprint Duration: 2 Weeks

---

## Sprint Overview

Sprint 2 hardened the application with a full RBAC system (SUPERADMIN / ADMIN / USER), soft-delete
architecture on products, and role-gated UI visibility. Row-Level Security policies were implemented
in Supabase to enforce access at the database level. All features were verified through a structured
test matrix covering 3 user types, 6 rights categories, and 18 documented test cases.

---

## Tasks Completed

### M1 — Project Lead / Full-Stack Developer

- [✅] RBAC roles defined: SUPERADMIN, ADMIN, USER — stored in `profiles.role` column
- [✅] Row-Level Security (RLS) policies written and enabled on `products` and `users` tables
- [✅] Soft-delete column (`deleted_at` timestamp) added to `products` table via migration
- [✅] `getProducts()` query updated with `ACTIVE` filter — excludes soft-deleted rows for USER role
- [✅] `DeletedItemsPage.jsx` implemented — visible only to ADMIN and SUPERADMIN
- [✅] `SoftDeleteDialog.jsx` built with confirmation modal and role-guard wrapper
- [✅] Stamp (audit) column conditionally rendered: hidden for USER, visible for ADMIN+
- [✅] `AdminRoute.jsx` guard created — blocks non-admin navigation at the route level
- [✅] Recovery flow implemented: ADMIN can restore soft-deleted products from Deleted Items view

**PRs Merged:**

- `PR-04` feat/rbac-roles — Role column, RLS policies, AdminRoute guard
- `PR-05` feat/soft-delete — Soft-delete migration, SoftDeleteDialog, DeletedItemsPage
- `PR-06` feat/audit-visibility — Stamp column visibility, ADMIN-only UI gating
- `PR-07` docs/sprint2-log — Sprint 2 documentation and test matrix

---

## Testing & QA

- Rights test matrix executed: 3 user types × 6 rights = 18 test cases, all documented with pass/fail
- Soft-delete visibility test: soft-delete a product as SUPERADMIN, confirm it vanishes from USER's list, confirm ADMIN can see it in Deleted Items
- Recovery test: ADMIN recovers the soft-deleted product, confirm it reappears for USER
- Direct API bypass test: USER calls `getProducts()` without the ACTIVE filter — confirm RLS blocks INACTIVE rows
- Stamp visibility test: log in as USER, confirm stamp column absent; log in as ADMIN, confirm stamp column present
- No hard delete audit: grep the codebase for any `'delete('` or `'.delete('` Supabase calls — must return zero results on product or user tables

---

## Sprint 2 Log Completed