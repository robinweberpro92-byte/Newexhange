# YasarPack architecture proposal

## Product approach

This codebase turns the premium redesign into a production-ready application skeleton instead of a static mockup.
The design language from the original premium homepage is kept through shared tokens, gradients, glass panels, Sora/Inter typography, and consistent dashboard shells.

## Core principles

- **Single product codebase** on Next.js App Router.
- **Server-first data loading** for dashboards, admin screens and homepage.
- **PostgreSQL + Prisma** as the source of truth.
- **NextAuth credentials flow** for secure session handling, with a clear upgrade path toward OAuth and 2FA.
- **Role-checked mutations** in middleware, server actions and route handlers.
- **Branding and CMS driven by database** instead of hardcoded page copy.
- **Extensible i18n** with default dictionaries plus DB overrides.

## Functional slices

### Public marketing
- Homepage sections hydrated from `BrandSetting`, `SiteSetting`, `PaymentMethod`, `Review`, `FaqItem`.
- Premium hero + trust + payments + loyalty + reviews + FAQ + final CTA.

### Authentication
- Login, registration, logout, forgot password, reset password.
- Passwords hashed with bcrypt.
- Rate-limited auth routes.
- Roles: `USER`, `ADMIN`.
- Future-ready `twoFactorEnabled` / `twoFactorSecret` fields.

### User workspace
- Overview
- Wallet aggregation from transactions
- Transactions history
- Loyalty status and points history
- KYC uploads with mock local storage
- Support tickets and threaded messages
- Profile, password, locale and notification settings

### Admin workspace
- KPI overview
- Users management
- Transactions management
- Payment methods full CRUD and ordering
- Reviews moderation
- Loyalty rules and tiers
- Support ticket handling
- CMS / FAQ
- Branding
- Translation overrides
- Admin logs

## Layers

### Presentation
- `src/app/*` routes
- `src/components/*`

### Application logic
- `src/actions/*`
- `src/lib/queries.ts`
- `src/lib/loyalty.ts`
- `src/lib/admin-log.ts`

### Infrastructure
- `src/lib/prisma.ts`
- `src/lib/auth.ts`
- `src/lib/security.ts`
- `src/lib/cms.ts`
- `src/lib/branding.ts`
- `src/lib/i18n.ts`

## Security decisions

- bcrypt password hashing
- route protection in middleware
- role checks repeated in every server mutation
- no secrets in code
- secure password reset tokens hashed in database
- simple in-memory rate limiter for local / single instance dev base
- server-side validation with Zod
- input sanitization for text fields
- admin actions logged in `AdminLog`

## Domain objects

- `User`
- `Account`, `Session`, `VerificationToken`, `PasswordResetToken`
- `Transaction`
- `PaymentMethod`
- `LoyaltyTier`, `LoyaltyPointHistory`
- `Ticket`, `TicketMessage`
- `KycSubmission`
- `Review`
- `FaqItem`
- `SiteSetting`
- `BrandSetting`
- `Translation`
- `AdminLog`

## Implementation order already reflected in the scaffold

1. Project structure + Prisma + PostgreSQL + auth.
2. Real user dashboard pages.
3. Real admin dashboard pages.
4. Configurable payment methods.
5. Loyalty engine + manual adjustments.
6. Support ticketing.
7. Branding + CMS + translations.
8. Seed + README + local setup.
