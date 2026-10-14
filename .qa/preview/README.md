# Isolated component preview

This local-only Next.js application renders the actual `EnquiryInbox`, `EnquiryDetailView`, `OwnerShell`, owner CSS and bundled Manrope font using 22 synthetic enquiries. It has no database access, production auth handler, environment files or real customer data. It lives outside the production app route tree.

From the owner-app root, run:

```powershell
node node_modules/next/dist/bin/next dev .qa/preview --hostname 127.0.0.1 --port 3002
```

Open `http://127.0.0.1:3002`. Filters, metrics, ordering, pagination, detail links and returning to the filtered list use the shared production components and filter types. `/empty` shows the no-enquiries state; a search such as `zznomatches` shows the no-matches state; `/error` renders the real owner error component. The first enquiry serves the local synthetic `preview-image.png` for image preview and download checks; the fourth enquiry exercises image-preview HTTP 503 feedback. All other attachment requests return HTTP 503. The sidebar uses the actual client-side sign-out component, but the fixture-only auth endpoint always rejects it and never contacts an auth provider. `/account` and `/login` explicitly disclose that authentication is excluded.

Do not deploy this fixture application or treat its results as an authentication or live-database integration test. The production app is served separately on its usual port and retains its normal access controls.
