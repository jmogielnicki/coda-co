# CodaCo admin runbook 

A non-technical guide to the admin tools on CodaCo. Read this if you need
to review vendor applications, look up data, log in as a test user, or
debug something a vendor reports.

If you're a developer working on the code itself, start with
[`AGENTS.md`](../AGENTS.md) and [`data-model-evolution.md`](data-model-evolution.md)
instead.

---

## What lives where

| URL                    | What it is                                        | Who can see it |
|------------------------|---------------------------------------------------|----------------|
| `/`                    | Public homepage                                   | Anyone         |
| `/shop`, `/services`   | Public catalog                                    | Anyone         |
| `/list-with-us/goods`  | Vendor signup wizard (goods)                      | Anyone (signs in along the way) |
| `/list-with-us/services` | Vendor signup wizard (services)                 | Anyone         |
| `/login`, `/signup`    | Auth pages                                        | Anyone         |
| `/dashboard`           | A vendor's own dashboard                          | Signed-in vendors only |
| `/dashboard/products`  | A vendor's product list (draft + published)      | Signed-in vendors only |
| `/admin`               | **Database Viewer** — read-only browser of every table | Signed-in admins only |
| `/admin/applications`  | **Vendor application queue** — approve/reject signups | Signed-in admins only |

If you visit an admin or dashboard URL without being signed in, the site
redirects you to `/login` and brings you back after sign-in. If you're
signed in as a non-admin, `/admin*` silently redirects you home (the nav
won't even show the admin links).

---

## Logging in

Everyone uses email + password. There is **no password reset or change UI
yet** (see `TASKS.md`), so the only credentials that work are the ones in
this doc or whatever a real user signed up with.

### As the admin

| Field    | Value                  |
|----------|------------------------|
| Email    | `admin@codaco.local`   |
| Password | `codaco-dev`           |

The admin account can:

- View every row in every table via `/admin`
- Approve or reject vendor applications at `/admin/applications`
- See the "Admin" links in the top nav (regular users don't)

### As a mock vendor

Every seeded vendor uses the same pattern:

| Field    | Value                              |
|----------|------------------------------------|
| Email    | `{vendor-slug}@codaco.local`       |
| Password | `codaco-dev`                       |

Example: `earthen-studio@codaco.local` / `codaco-dev` signs you in as the
Earthen Studio vendor, with three urns already listed on their dashboard.

The 18 seeded vendor slugs are:

`earthen-studio`, `maria-rosales`, `threshold-wellness`, `jade-castillo`,
`james-thornton`, `keepsake-co`, `gentle-passage`, `threshold-press`,
`green-passage`, `still-life-studio`, `sunlight-leaving`,
`alma-park-celebrations`, `front-range-death-cafe`,
`denver-death-cafe-collective`, `willow-grief-therapy`,
`marcus-okafor-grief`, `prairie-rest-conservation`,
`aspen-meadow-natural-burial`

### As a real vendor (for support / debugging)

There's no "impersonate user" feature yet. If you need to see what a real
vendor sees, you have two options:

1. **Reset their password yourself.** Currently the only way is a manual
   `UPDATE users SET password_hash = ...` against the database. Ask a
   developer.
2. **Recreate the issue from your own test vendor account.** Often
   faster — pick a mock vendor and reproduce the steps.

A proper "log in as this user" flow for support is on the list of things
to build but not done.

### Inviting a new vendor

`/signup` is gated by a shared invite code. Anyone without the code
sees a friendly "That invite code isn't valid" error and no account is
created — that's the bot shield while we're still in demo mode.

The current code is **`codaco-2026-invited`**. Hand it to the vendor
along with the signup URL when you schedule a demo. Rotate it (in
Vercel → Settings → Environment Variables → `INVITE_CODE`) if it leaks
or after the demo phase ends.

If `INVITE_CODE` is unset in Vercel, `/signup` is disabled entirely
("Signup is currently disabled.") — fail-closed by design, so a
misconfigured environment can't accidentally open signup to the world.

---

## Tour: the Database Viewer (`/admin`)

A read-only browser of every table in the database. Use this when you
need to answer questions like "did that vendor's product actually save?"
or "how many reviews does this product have?"

What you'll see:

- **Top stats:** counts of Products, Vendors, Services, Reviews.
- **Tabs:** Products, Vendors, Services, Reviews, Vendor Reviews, Plans.
  Each tab is a filterable table.
- A button in the top right to **Vendor applications →** (the approval
  queue).

What it does NOT let you do:

- Edit rows. It's view-only. To change data you either log in as the
  relevant user (vendor changes their own product, admin approves an
  application) or ask a developer.
- Delete rows.
- See orders (Phase E hasn't shipped yet).

Tip: every row in the viewer uses the **public slug** (e.g.
`urn-sage-001`, `maria-rosales`) — not the internal database id. So
slugs you see here match slugs in URLs.

---

## Tour: the application queue (`/admin/applications`)

This is the workflow for approving new vendors.

**Pending review** — every application with status `submitted`. Each row
shows:

- Proposed display name + slug
- Applicant's email
- Kind (goods / services / both)
- Plan chosen (starter / standard / pro)
- Proposed bio
- An **Approve** and **Reject** button

When you click **Approve**, the system does three things in one
transaction:

1. Marks the application `approved`, recording who approved it and when
2. Creates a `vendor_profile` row tied to the applicant's user account
3. Creates a `subscription` row for the plan they chose

The applicant can now log in and see their dashboard. If they were the
ones who clicked "List with us", their next page load picks up the new
status automatically.

When you click **Reject**, the application is marked `rejected` and the
applicant can re-apply. No profile or subscription is created.

**Recently decided** — the 20 most recent approved/rejected applications,
for context. Useful if someone asks "did we approve this one already?"

### Auto-approve is on in production

The live site has the env var `DEMO_AUTO_APPROVE_VENDORS=1` set. While
that flag is on, **every application is auto-approved at submission time**
— it bypasses the queue entirely. The applicant lands in their dashboard
immediately.

This is intentional for the live demo. If you see an empty queue but
applications are coming through, that's why. The flag should be flipped
off the moment we onboard real vendors who need real review. The queue UI
itself still works in both modes — auto-approve just skips it.

---

## Tour: a vendor's dashboard (`/dashboard`)

Log in as any mock vendor (e.g. `earthen-studio@codaco.local`) to see
what a real vendor sees:

- **Top stats:** published products, draft products, services
- **Your products:** link to manage / create products. New products
  default to `draft` status and aren't visible on `/shop` until the
  vendor clicks **Publish** in the product editor.
- **Your public profile:** link to the vendor's live profile page at
  `/services/{slug}`, exactly as buyers see it.

Vendors can:

- Create, edit, and delete their own products (drafts only — published
  products can be unpublished by toggling status back)
- See their subscription tier
- View their live public profile

Vendors **cannot** see other vendors' data, the admin tools, or anything
about other applicants.

---

## Identifying test vs. real data

There is **no `is_mock` flag** on any table. Instead, the convention is:

> **Every seeded test user has an email ending in `@codaco.local`.**

`.local` is a reserved domain (RFC 6762, mDNS), so no real human will
ever sign up with one. That gives a clean way to identify the entire
mock tree:

- Mock users → emails end in `@codaco.local`
- Real users → emails end in anything else (`gmail.com`, `codaco.com`,
  etc.)

Because the database is set up with cascade deletes, removing a mock user
also removes their vendor profile, their products, their services, their
reviews, and their subscriptions. So "clean up the test data" is a single
operation on the `users` table.

---

## Common runbook tasks

### "A vendor says their product isn't showing up on /shop"

Likely causes, in order of frequency:

1. **The product is still a draft.** Check `/admin` → Products tab → find
   their product by slug. If status is `draft`, ask them to click
   **Publish** in their product editor. Drafts never appear on `/shop`.
2. **They published recently and their browser is cached.** Hard-refresh.
3. **They're not approved yet.** Check `/admin/applications`. If the
   queue has them pending (and `DEMO_AUTO_APPROVE_VENDORS` isn't on),
   approve them.

### "I need to look up everything we know about a vendor"

Use `/admin` and search the Vendors tab for their slug. From the row
you'll see their kind, location, subscription, verification status, etc.
Then jump to Products / Services / Reviews tabs and filter by their
slug.

### "Did this application come through?"

Visit `/admin/applications`. If auto-approve is on, look under "Recently
decided" — it'll show as approved already with a `reviewed_at` matching
the submission time.

### "A new vendor signed up but I don't see them in the queue"

Almost always because auto-approve is on. They went straight to a
vendor profile. Look under Vendors in `/admin` and you'll find them.

### "We're ready to launch with real vendors — clear the test data"

When the time comes:

1. Confirm the live site has `DEMO_AUTO_APPROVE_VENDORS` removed (or the
   real-vendor review workflow is otherwise in place).
2. Run the mock-data cleanup. **A `scripts/remove-mock-data.mjs` script
   doesn't exist yet** — see `TASKS.md`. Ask a developer to write it.
   The shape is roughly:

   ```ts
   await prisma.user.deleteMany({
     where: { email: { endsWith: "@codaco.local" } },
   });
   ```

   Cascades handle the rest (vendor profiles, products, services,
   reviews, subscriptions all delete with the user).

   The script should default to a **dry-run** that just prints "would
   delete N users". An explicit `--confirm` flag actually runs the delete.

### "I want to test the full vendor signup flow as a brand-new user"

1. Sign out of any current session.
2. Visit `/list-with-us/goods` or `/list-with-us/services`.
3. Pick a new email (anything not ending in `@codaco.local` works, e.g.
   `test+abc@example.com`).
4. Walk through the 4-step wizard.
5. With auto-approve on, you'll land on `/dashboard` immediately. Add a
   product, publish it, verify it appears on `/shop`.

Clean up afterward: log in as admin and delete the user via a developer
(no UI for self-service deletion yet).

### "The live site looks broken"

1. Check https://coda-co-nine.vercel.app loads at all. If not, it's a
   deploy or DB issue — ping a developer.
2. Open `/admin`. If you can sign in and see data, the database is up
   and the auth chain works.
3. Check recent merges in GitHub. Every merge to `main` triggers a
   Vercel build automatically; a failing build leaves the previous
   deploy in place but blocks new changes.

---

## Environment flags worth knowing

These live on Vercel (Settings → Environment Variables) and affect
behavior in production. **Don't change them without checking with a
developer**, but it helps to know what they do.

| Var                            | Effect when set                                       |
|--------------------------------|-------------------------------------------------------|
| `DEMO_AUTO_APPROVE_VENDORS=1`  | Auto-approves every vendor application on submission. Currently ON for the live demo. Turn off once real vendor review is needed. |
| `INVITE_CODE`                  | Shared secret required at `/signup`. Current value: `codaco-2026-invited`. Unsetting it disables signup entirely (fail-closed). See **Inviting a new vendor** above. |
| `DATABASE_URL`                 | The Neon Postgres connection string for **production**. Preview deploys get their own branch URL injected per-deployment by the Vercel-Neon integration — don't set `DATABASE_URL` in Preview scope manually. Changing the Production value points the site at a different database. |
| `DATABASE_URL_UNPOOLED`        | Direct (non-pooled) Neon URL used by `prisma migrate deploy` (Neon's pgbouncer can't proxy migration DDL). Also injected by the Vercel-Neon integration; mirror any prod rotation of `DATABASE_URL` here. |
| `AUTH_SECRET`                  | Signs session tokens. Changing it logs everyone out. |
| `ALLOW_MOCK_SEED=1`            | Bypasses the safety guard that blocks `db:mock` in production. Should NOT be set in production env vars. (Even if it is, the build doesn't call `db:mock`, so it's inert — but tidier to remove it.) |

---

## What's out of scope for admins right now

Things you might expect to do but can't yet (all tracked in `TASKS.md`):

- **Edit user data** from the admin UI. Read-only for now.
- **Impersonate / log in as a specific user** for support. Workaround:
  use a mock vendor account.
- **Reset a user's password** from the UI. No flow exists; needs a
  developer.
- **See orders.** Phase E hasn't shipped.
- **Send a transactional email** (welcome, password reset, order
  receipt). The email channel itself doesn't exist yet — comes with
  Phase E.

---

## Glossary

- **Phase A–F** — the phased rebuild plan. See
  `docs/data-model-evolution.md`. We've shipped A through D. Phase D is
  the demo-ready milestone.
- **Mock data** — fake users + products + reviews seeded by
  `npm run db:mock`. All emails end in `@codaco.local`.
- **System data** — `product_types` and `service_types` reference rows.
  Seeded by `npm run db:seed`. Safe to run in production; idempotent.
- **Slug** — the human-readable id used in URLs (e.g. `urn-sage-001`,
  `maria-rosales`). The database has a separate internal id you'll
  never see; everything user-facing uses slugs.
- **Vendor application** — a submission from `/list-with-us/...` that
  represents "I want to be a vendor." Becomes a real `vendor_profile`
  only after approval.
- **Vendor profile** — the row that makes someone a vendor. Created by
  approving an application.
- **Draft vs. published** — products have a status. Drafts are invisible
  to buyers; published products show up on `/shop` and the vendor's
  profile page.
