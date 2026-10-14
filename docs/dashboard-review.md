# Dashboard and enquiry review

The owner workspace now follows the public studio's visual identity while keeping the enquiry workflow read-only. Existing records, schema, private storage, and managed authentication are preserved.

## Source and enquiry journey

The public implementation is in the separate checkout `D:\Agency\vivatiles`, not this application's repository root. Its `src/app/globals.css` supplies the paper (`#eae4da`), stone (`#d0c6ba`), ink (`#1c1a1a`), and forest (`#303c32`) palette. The workspace uses the same bundled Manrope family with restrained headings, borders, and spacing.

The public `ProjectEnquiry.tsx` submits customer and project fields plus an optional inspiration file to the enquiry handler. `src/lib/enquiry.ts` validates the form and generates a reference; `src/lib/enquiry-neon.ts` stores the private file and inserts the 17-column `public.project_enquiries` record before confirming receipt. The owner [data layer](../src/lib/enquiries.ts) reads that same schema after checking the approved, verified owner session. It maps the brief, contact details, project fields, desired date, and attachment metadata into the list and detail view. Private files are read through the authenticated owner endpoint with bounded bytes and generated download names.

Product links can prefill the public idea text; there is no separate selected-product field. The schema also has no enquiry status, internal notes, assignee, or reply history. Consequently, no unresolved/new-status counts or editing controls are presented. “Last 7 days” means received during that period, not unread. Reply links open the local email client.

## Findings and changes

| Finding | Implemented change |
| --- | --- |
| The previous green-and-white presentation diverged from the studio's materials and typography. | Reused the landing palette and Manrope, reduced heading scale and decoration, and aligned navigation, panels, and controls. |
| Overview counts offered limited paths into relevant work. | Three database-backed metrics link to all enquiries, submissions from the last seven days, and enquiries with inspiration. |
| Reviewing older or attachment-bearing enquiries required extra scanning. | Added attachment filtering and stable newest/oldest ordering alongside search, project type, dates, and pagination. |
| Opening a detail could lose the working list context. | Shared normalized query links preserve search, filters, order, and page on the return link. |
| Dense desktop rows did not suit narrow screens. | Added mobile enquiry cards and stacked detail/contact sections, with readable dates and direct contact actions. |
| A failing attachment navigation could replace the enquiry with an error response. | Downloads now stay in place, prevent duplicate clicks, announce pending and download-started states, and show safe retry messages for expired sessions, permissions, missing files, and service/network failures. |
| Everyday state feedback was inconsistent; verification redirects and skip-link focus needed attention. | Added filter and refresh feedback; retained distinct empty/no-match states, loading/error views, visible focus states, and disabled controls. Unverified owners now go directly to verification; skip links focus the main content. |

## Verification and evidence

- Owner lint, typecheck, production build, and **25 tests passed**. Coverage includes authorization, parameterized filtering, stable ordering, list context, data mapping, private attachment constraints, and download-response handling. JPEG/PNG/WebP responses retain their MIME type and bytes for preview; SVG/HTML responses are rejected.
- The public landing checkout's **54 tests passed** outside the Windows sandbox. The public implementation was inspected without changing its code or submitting real enquiries.
- Browser interaction checks verified search, sorting, date and attachment metric links, pagination, detail links retaining filters and page, inline attachment HTTP 503 feedback, refresh feedback, distinct no-match/empty/error states, and login/reset navigation. Keyboard checks confirmed visible focus for controls and focus transfer through Skip to content. No browser console errors remained in the final fixture run.
- The browser checks use [`.qa/preview`](../.qa/preview/README.md), an isolated local fixture application rendering the actual owner components with 22 synthetic enquiries. It has no database connection, production authentication handler, real credentials, or customer data. The first attachment serves a synthetic PNG; other attachment requests deliberately fail with HTTP 503. This is UI evidence, not a live authentication or delivery test.
- Inspiration images now load inline through the existing authenticated attachment endpoint and a component-owned Blob URL. Browser checks verified image decoding, enlarged viewing, Close/Escape dismissal and focus return, download feedback, error/retry, PDF download-only behavior, and 320px layout. Blob URLs are revoked on retry or unmount, and pending requests are aborted. No public storage URLs or shared image optimization are introduced.
- Inspected inbox layouts at 320, 768, 1024, and 1440 pixels; DOM measurements confirmed no horizontal overflow. Desktop tables switch to mobile cards, narrow filters retain legible selected values, and the mobile detail puts the project brief first. Screenshot inspection and keyboard checks are not a full screen-reader or automated accessibility certification.
- Before owner activation, local HTTP checks confirmed the unconfigured auth API and protected attachment endpoint return 503, public signup returns 404, and no fixture records appear in production responses. A subsequent activation created the approved temporary owner identity and requested its password-setup email.

Screenshots: [original setup state](screenshots/01-before-setup.png), [desktop inbox](screenshots/02-inbox-desktop.png), [desktop detail](screenshots/03-enquiry-desktop.png), [mobile inbox](screenshots/04-inbox-mobile.png), [mobile detail](screenshots/05-enquiry-mobile.png).

## Remaining dependencies and limits

The approved temporary owner is now configured in `OWNER_EMAILS`, its managed identity has been created, and Neon accepted the password-setup email request. The exact local origin `http://127.0.0.1:3001` was added to Neon Auth's trusted domains. The owner must complete the emailed password setup and verification; mailbox delivery, sign-in, sign-out, authenticated records, and successful attachment download through a live session remain to be verified.

Status updates, internal notes, ownership, and reply history would require a schema and authenticated write workflow; they are not supported by the current backend. The present inbox supports reviewing and contacting customers without implying that those actions are recorded.

The public form blocks duplicate clicks while a request is pending, but an accepted submission whose acknowledgement is lost can still be duplicated by a later retry: each request generates a new reference and there is no durable idempotency key. Its in-process rate limiter also needs a shared store for reliable enforcement across multiple server instances. These are existing public-submission backend limitations, not changes made by the owner-dashboard work.

