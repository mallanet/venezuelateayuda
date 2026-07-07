# Technical Debt Ledger

Created: 2026-07-06
Session: audit full — Batch 1 cleanup
Sorted by value-per-effort (highest first)

## 1. Fix TS errors in auth.ts (next-auth v5 JWT augmentation)
- **Area:** `src/lib/auth.ts:25`
- **Issue:** `declare module "next-auth/jwt"` fails — module not found in next-auth v5 beta. Cascades to lines 84-85 where `token.role`/`token.status` typed as `{}`.
- **Suggested fix:** Restructure JWT augmentation without `declare module`. Use `NextAuth()` callback types directly or import JWT type from correct path.
- **Effort:** M
- **Value:** high (unblocks `tsc --noEmit`)

## 2. Add error states to 6 SWR components
- **Area:** `map-explorer.tsx`, `home-hero-map.tsx`, `professionals-directory.tsx`, `admin-dashboard.tsx`, `mensajes/page.tsx`, `mensajes/[id]/page.tsx`
- **Issue:** All 6 SWR-using components destructure `{ data, isLoading }` but never `error`. Network failure → perpetual loading or empty state with no error communication.
- **Suggested fix:** Destructure `error` from `useSWR`, show inline error banner/message when `error` is set.
- **Effort:** M
- **Value:** high (UX quality, frontend.mdc compliance)

## 3. Wrap admin actions in $transaction
- **Area:** `src/app/api/admin/actions/route.ts`
- **Issue:** 7 mutation+auditLog pairs without `$transaction`. If audit log write fails after mutation, data is inconsistent.
- **Suggested fix:** Wrap each case's writes in `prisma.$transaction(...)`.
- **Effort:** XS
- **Value:** high (data integrity, backend.mdc compliance)

## 4. Rename `const data = await res.json()` → named variable
- **Area:** 9 files — `registro/page.tsx`, `ayuda/nueva/page.tsx`, `profile-form.tsx`, `close-listing-button.tsx`, `report-dialog.tsx`, `contact-button.tsx`, `register/route.ts`, `profile/route.ts`, `admin/actions/route.ts`
- **Issue:** Banned word `data` as variable name (naming.mdc violation).
- **Suggested fix:** Replace with `body`, `jsonBody`, `result`, or destructure inline (e.g., `const { error } = await res.json()`).
- **Effort:** XS
- **Value:** medium (naming clarity)

## 5. Rename `handle[A-Z]` functions
- **Area:** 8 files, 18 occurrences — `registro/page.tsx`, `login/page.tsx`, `ayuda/nueva/page.tsx`, `mensajes/[id]/page.tsx`, `report-dialog.tsx`, `profile-form.tsx`, `contact-button.tsx`, `close-listing-button.tsx`
- **Issue:** `handleSubmit`, `handleClick`, `handleSend`, `handleStateChange` violate banned `handle` prefix (naming.mdc + prompt.mdc).
- **Suggested fix:** `handleSubmit` → `submit`, `handleClick` → `onClick`/`click`, `handleSend` → `send`, `handleStateChange` → `onStateChange`.
- **Effort:** M
- **Value:** medium (naming rule compliance)

## 6. Split oversized components
- **Area:** `admin-dashboard.tsx` (330 lines), `map-explorer.tsx` (221 lines), `ayuda/nueva/page.tsx` (221 lines), `registro/page.tsx` (188 lines)
- **Issue:** Components exceed frontend.mdc line-count thresholds.
- **Suggested fix:** Extract sub-components (e.g., admin tabs, map sidebar, listing form sections).
- **Effort:** L
- **Value:** medium (maintainability)

## 7. Remove dead exports from 7 UI component files
- **Area:** `badge.tsx`, `button.tsx`, `card.tsx`, `dialog.tsx`, `select.tsx`, `sheet.tsx`, `tabs.tsx`
- **Issue:** 12+ variant/component exports flagged as dead by knip. Nothing imports them.
- **Suggested fix:** Remove `export` keyword from unused variants (e.g., `badgeVariants`, `buttonVariants`, `CardFooter`, etc.).
- **Effort:** XS
- **Value:** low (dead code removal)

## 8. Consolidate api-helpers.ts into session-guards.ts
- **Area:** `src/lib/api-helpers.ts`, `src/lib/session-guards.ts`, 3 importing routes
- **Issue:** Two files export identical `SessionUser`, `getSessionUser`, `getAdminUser` with slightly different error handling. Partially done in working tree.
- **Suggested fix:** Delete `api-helpers.ts`, update 3 routes to import from `session-guards.ts`.
- **Effort:** XS
- **Value:** medium (DRY)
