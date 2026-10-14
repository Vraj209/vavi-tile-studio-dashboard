# VAVI Owner

A separate Next.js application for the VAVI team at `D:\Agency\vivatilestudio_owner\owner-app`. The public landing page is a separate checkout at `D:\Agency\vivatiles`. Each application has its own dependencies, lockfile, build, server, environment, and deployment. The owner app reads the same `public.project_enquiries` table and private attachments written by the landing page.

## Run

```sh
cd owner-app
npm ci
npm run dev
```

Open http://127.0.0.1:3001. The landing page can run separately on port 3000. For a production server, use `npm run build` then `npm start`. Both local server commands bind to loopback.

## Features

- Search all stored inquiries by name, email, company, phone, location, project, idea, or reference.
- Filter by project type, received date, and attached inspiration; sort newest or oldest first, with server pagination.
- Open overall, last-seven-days, and attachment counts directly into the corresponding inbox view. Counts come from the database.
- Keep search, filters, order, and page when opening an enquiry and returning to the list.
- Open complete project briefs, customer contact information, desired dates, dimensions, and attached inspiration.
- Read a compact table on desktop and enquiry cards on mobile, with distinct empty-inbox and no-matching-results states.
- Download attachments through an authenticated server route, with pending, download-started, and retry feedback in the detail view. A failed download keeps the enquiry open. Storage URLs and keys are never returned to the browser.
- Preview JPEG, PNG, and WebP inspiration images inline, with a larger image dialog, keyboard dismissal, and retry feedback. Previews use the same authenticated endpoint; PDF attachments remain downloadable.
- Managed Neon email/password login, password reset, email verification codes, account details, and sign-out.
- Approved email addresses and verified sessions are required on every database or file read. Public sign-up and admin APIs are not exposed by this application.

The inbox is read-only. Use **Refresh** to check for newly submitted inquiries; the control confirms when the refresh finishes. There is no automatic polling or workflow/status editing. Reply links open the team's email client; the dashboard does not send or record replies.

The interface reuses the landing page's paper, stone, ink, and forest palette and bundled Manrope family. See the [dashboard review](docs/dashboard-review.md) for findings, changes, screenshots, and remaining integration checks.

## Current local setup

Neon Auth was enabled on the existing inquiry database branch. The supplied `.env` contains the database and storage connection settings. `.env.local` retains the owner authentication settings, storage bucket, and generated cookie secret; both files are ignored by Git. Next.js and `owner:setup` load both files, with `.env.local` taking precedence for duplicate keys. The old `DATABASE_URL` override was removed from `.env.local` so the supplied `.env` is used. `OWNER_EMAILS` now contains the user-approved temporary owner address. The main owner can be added later using the same activation procedure.

A read-only connection check using the supplied `.env` succeeded: the enquiry table has all 17 expected columns and currently contains one enquiry with one attachment. No customer details or credentials were printed and no records were changed. Port 3001 is the actual owner app; port 3002 is the isolated synthetic preview and never reads this database.

A temporary owner identity was created on October 13, 2026 (America/Toronto), and Neon accepted the password-setup email request. The exact local origin `http://127.0.0.1:3001` is registered in Neon Auth's trusted domains. Mailbox receipt, password selection, and email verification still require the owner. No existing inquiry rows were changed.

For a new machine, copy `.env.example` to `.env.local` and fill in the server-only values:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Same Neon database and branch as the public form; use a server role allowed to read `public.project_enquiries`. |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ENDPOINT_URL_S3`, `AWS_REGION` | Credentials for the same private storage branch as the landing page. |
| `ENQUIRY_STORAGE_BUCKET` | Existing bucket; defaults to `viva-tile-studio`. |
| `NEON_AUTH_BASE_URL` | Managed Auth URL for this branch, including its database/auth path. |
| `NEON_AUTH_COOKIE_SECRET` | A randomly generated secret of at least 32 characters; keep it stable across owner-app instances. |
| `OWNER_EMAILS` | Comma-separated, exact email addresses allowed to read inquiries. No wildcards or email-domain grants. |
| `OWNER_APP_URL` | Owner application origin, recorded for setup/deployment reference. Reset requests use the current browser origin. |

No variable should be prefixed with `NEXT_PUBLIC_`. Each app loads its own environment; the owner app does not automatically load the landing checkout's files.

## Activate the first owner

1. Add the approved address to `OWNER_EMAILS` in `.env.local`, then restart the owner server. Keep other team members only if they should have full access to every inquiry.
2. Run this from `owner-app`, substituting the actual approved email and name:

   ```sh
   npm run owner:setup -- --email owner@example.com --name "Owner Name" --origin http://127.0.0.1:3001
   ```

   This command creates a managed identity with a random password that is never printed or stored by the script, then requests an email link to choose a password. **It sends account email when you run it.** It refuses an email not already approved in `OWNER_EMAILS`. For an existing identity or to retry email delivery, use `--reset-only` (no `--name` needed).
3. The owner follows the emailed reset link, chooses their password, and signs in. The app then offers a verification code by email if the address is not already verified.
4. After verification, open the inbox. Test sign-out, reload, and the full reset flow with the real mailbox.

Use `npm run owner:setup -- --help` for options. Accounts and sessions are managed by Neon Auth; the application never stores passwords in the inquiry table. To add another approved team member, add their email to the allowlist and run setup for that address. To revoke access, remove the address and restart/redeploy every owner-app instance; use Neon Auth to revoke sessions or disable the identity as needed. Every data read checks the live session, so provider revocations do not rely on the SDK's cached session cookie.

## Deploy independently

Create a separate hosting project and owner-facing domain. Point its root directory at this `owner-app` directory (`owner-app` when the deployment checkout contains its parent, or `.` when this directory is the checkout root). Install with `npm ci` and build with `npm run build`.

Configure the owner's environment values on that project. Point its database and storage settings at the same branch used by the public landing page. Register the exact HTTPS owner-app origin in Neon Auth's trusted domains before issuing password setup/reset emails for it. Localhost is currently allowed for development.

Neon's shared email provider supports password reset links and verification codes for local setup. Configure custom SMTP and test delivery for production following the [Neon production checklist](https://neon.com/docs/auth/production-checklist). This app does not enable public account registration; other sites using the same Auth branch must enforce their own permissions.

The app emits noindex/noarchive and private responses. It has not been deployed publicly. Existing-session revocation specifically after a password reset is provider-controlled; verify the managed configuration rather than assuming it from this client implementation.

## Checks

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

Authorization tests cover missing/expired/mismatched sessions, unverified or unapproved accounts, banned identities, impersonation, and disabled auth endpoints. Data tests cover authorization before I/O, bound search parameters, attachment filtering, stable sorting, pagination, list-context links, full detail mapping, private downloads, metadata constraints, size limits, and safe failures. Download-client tests check credentialed requests, safe filenames, failed responses, and unexpected HTML.

Verification performed during implementation:

- Owner app lint, TypeScript, production build, and all 25 tests passed.
- All 54 public landing-page tests passed outside the Windows sandbox; this did not submit a real enquiry or change the landing implementation.
- Browser checks using the [isolated preview](.qa/preview/README.md) verified search, sorting, detail-to-list context, attachment HTTP 503 feedback, and refresh. The preview renders shared production components with synthetic records and has no live data or authentication.
- Image preview checks verified decoded image bytes, enlarged viewing, Close/Escape and focus return, successful download feedback, error/retry, PDF fallback, and 320px layout without horizontal overflow.
- Desktop and mobile screenshots are linked in the [dashboard review](docs/dashboard-review.md); layouts were checked at 320, 768, 1024, and 1440 pixels with no horizontal overflow.

The temporary owner is approved and the password-setup email has been requested. Real sign-in, email receipt, reset completion, authenticated browser data, and attachment download through a real session remain to be verified after the owner completes the emailed setup flow. Open the local reset link on the computer running this app. Unit tests and the synthetic preview do not substitute for that end-to-end check.


