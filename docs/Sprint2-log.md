# HopePMS — Sprint 2 Log
**Branch:** `docs/sprint2-log` | **PR:** PR-03
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
- [✅] All product API calls wired: `getProducts()`, `addProduct()`, `updateProduct()`, `softDeleteProduct()`, `recoverProduct()`
- [✅] `getProducts()` passes `userType` — returns ACTIVE only for USER, all records for ADMIN/SUPERADMIN
- [✅] All priceHist API calls wired: `getPriceHistory()`, `addPriceEntry()`
- [✅] `UserRightsContext` integrated at app level — available to all pages via `useRights()` hook
- [✅] Route guard for `/deleted-items`: redirects USER accounts to `/products`
- [✅] Error boundary and loading states implemented on product list and form pages

**PRs Merged:**
- `PR-01` feat/product-api — getProducts, addProduct, updateProduct, softDelete, recover service functions
- `PR-02` feat/pricehist-api — getPriceHistory, addPriceEntry service functions
- `PR-03` feat/route-guard-deleted — /deleted-items blocked for USER accounts

---

### M2 — Frontend Developer (UI/UX)
- [✅] `ProductListPage`: table with prodCode, description, unit, current price; stamp column shown only to ADMIN/SUPERADMIN; INACTIVE rows hidden from USER
- [✅] `AddProductModal`: form with prodCode, description, unit fields; only visible when PRD_ADD = 1
- [✅] `EditProductModal`: pre-filled form; only visible when PRD_EDIT = 1
- [✅] `SoftDeleteDialog`: confirmation modal; only visible when PRD_DEL = 1
- [✅] `PriceHistoryPanel`: expandable panel per product showing all priceHist rows with effDate + unitPrice
- [✅] `AddPriceEntryForm`: inside PriceHistoryPanel; allows ADMIN/SUPERADMIN to add new price entry
- [✅] `DeletedItemsPage`: table of INACTIVE products with prodCode, description, stamp, and Recover button; ADMIN/SUPERADMIN only
- [✅] Sidebar Deleted Items link hidden for USER accounts

**PRs Merged:**
- `PR-01` feat/ui-product-list — ProductListPage with stamp gating and status filter
- `PR-02` feat/ui-product-crud — AddProductModal, EditProductModal, SoftDeleteDialog
- `PR-03` feat/ui-price-history — PriceHistoryPanel + AddPriceEntryForm
- `PR-04` feat/ui-deleted-items — DeletedItemsPage with Recover button

---

### M3 — Backend / Database Engineer
- [✅] RLS policy on `product` table — SELECT: USER sees ACTIVE only; ADMIN/SUPERADMIN see all
- [✅] RLS policy on `product` table — INSERT: only if PRD_ADD right = 1
- [✅] RLS policy on `product` table — UPDATE (edit fields): only if PRD_EDIT right = 1
- [✅] RLS policy on `product` table — UPDATE (record_status to INACTIVE): only if PRD_DEL right = 1
- [✅] RLS policy on `product` table — UPDATE (record_status to ACTIVE / recovery): only ADMIN or SUPERADMIN
- [✅] RLS policy on `pricehist` — SELECT and INSERT for authenticated users
- [✅] SQL view `current_product_price`: returns latest unitPrice per prodCode from pricehist
- [✅] All policies tested via Supabase SQL editor

**PRs Merged:**
- `PR-01` db/rls-product-select — SELECT policy
- `PR-02` db/rls-product-write — INSERT + UPDATE policies
- `PR-03` db/view-current-price — current_product_price SQL view

---

### M4 — Rights & Authentication Specialist
- [✅] `UserRightsContext.jsx`: on login, queries `UserModule_Rights` for current user, stores result as `{ PRD_ADD: 1, PRD_DEL: 0, ... }`
- [✅] `useRights()` hook: returns the rights map from context
- [✅] Add button gated: only rendered when `rights.PRD_ADD === 1`
- [✅] Edit button gated: only rendered when `rights.PRD_EDIT === 1`
- [✅] Delete button gated: only rendered when `rights.PRD_DEL === 1`
- [✅] Stamp column gated: rendered only when `user_type` is ADMIN or SUPERADMIN
- [✅] Sidebar Deleted Items link gated: only rendered when `user_type` is ADMIN or SUPERADMIN

**PRs Merged:**
- `PR-01` feat/rights-context — UserRightsContext + useRights hook
- `PR-02` feat/rights-ui-gating — Button gating (Add/Edit/Delete) and stamp column visibility
- `PR-03` feat/rights-sidebar — Sidebar link gating for Deleted Items

---

### M5 — QA / Documentation Specialist
- [✅] Rights test matrix executed: 3 user types × 6 rights = 18 test cases, all pass
- [✅] Soft-delete visibility test: soft-delete as SUPERADMIN, confirmed vanishes from USER list, ADMIN sees in Deleted Items
- [✅] Recovery test: ADMIN recovers product, confirmed reappears for USER
- [✅] Direct API bypass test: USER calls `getProducts()` without ACTIVE filter — RLS blocks INACTIVE rows
- [✅] Stamp visibility test: USER — stamp column absent; ADMIN — stamp column present with value
- [✅] No hard delete audit: `grep -rn "\.delete(" src/` returns zero results on product or user tables

**PRs Merged:**
- `PR-01` test/sprint2-rights-matrix — 18-case rights test results
- `PR-02` test/sprint2-softdelete-visibility — Soft delete, recovery, API bypass, stamp tests
- `PR-03` docs/sprint2-log — Sprint 2 log with findings and fixes

---

## Findings & Fixes

| # | Finding | Fix Applied |
|---|---|---|
| 1 | Recursive RLS on `user` table caused infinite loading on login | Replaced subquery-based policies with simple `USING (true)` SELECT policy |
| 2 | `UserModule_Rights` table queried with wrong column names (`right_value` vs `rights_value`) | Confirmed correct column via CSV export; `right_value` is correct in `UserModule_Rights` |
| 3 | `pricehist` columns accessed as camelCase (`effDate`, `unitPrice`) in `PriceHistoryPanel` | Fixed to lowercase (`effdate`, `unitprice`) to match actual DB schema |
| 4 | Settings section in sidebar had section-level `roles` gate blocking USER accounts with `ADM_USER=1` | Removed section-level `roles`; item-level `requiredRight` now controls visibility |
| 5 | `isSyncing` guard hiding nav items permanently if auth loading stayed true | Changed to `loadingRights` guard only for `requiredRight` items |

---

## Sprint 2 Gate Status
- [✅] All 18 rights test cases pass
- [✅] Soft-delete visibility verified — USER cannot see INACTIVE rows
- [✅] Recovery flow verified — restored product reappears for USER
- [✅] No hard deletes found in codebase
- [✅] Stamp column correctly gated by role

