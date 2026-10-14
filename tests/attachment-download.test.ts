import test from "node:test";
import assert from "node:assert/strict";
import { AttachmentDownloadError, fetchAttachment } from "../src/lib/attachment-download";

const reference = "cb6d2e8a-a4bb-4db7-a875-bdd987bd98f7";
const filename = `inspiration-${reference}.pdf`;

test("attachment requests retain owner authentication and accept the server's safe filename", async () => {
  const controller = new AbortController();
  const result = await fetchAttachment(reference, controller.signal, async (input, options) => {
    assert.equal(input, `/api/enquiries/${reference}/attachment`);
    assert.equal(options?.credentials, "same-origin");
    assert.equal(options?.cache, "no-store");
    assert.equal(options?.redirect, "error");
    assert.equal(options?.signal, controller.signal);
    return new Response("pdf bytes", { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${filename}"` } });
  });
  assert.equal(result.filename, filename);
  assert.equal(await result.blob.text(), "pdf bytes");
});

test("authentication, missing-file and storage errors provide safe retry feedback", async () => {
  for (const [status, message] of [
    [401, /session has expired/],
    [403, /does not have permission/],
    [404, /no longer available/],
    [503, /temporarily unavailable/],
    [500, /could not be loaded/],
  ] as const) {
    await assert.rejects(
      fetchAttachment(reference, new AbortController().signal, async () => new Response("internal storage credentials must never appear", { status })),
      (error: unknown) => error instanceof AttachmentDownloadError && message.test(error.message),
    );
  }
});

test("network errors and unexpected successful HTML cannot become downloaded files", async () => {
  await assert.rejects(
    fetchAttachment(reference, new AbortController().signal, async () => { throw new TypeError("Failed to fetch"); }),
    /Could not connect/,
  );
  await assert.rejects(
    fetchAttachment(reference, new AbortController().signal, async () => new Response("<html>Sign in</html>", { headers: { "Content-Type": "text/html" } })),
    /could not be loaded/,
  );
  await assert.rejects(
    fetchAttachment(reference, new AbortController().signal, async () => new Response("", { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${filename}"` } })),
    /could not be loaded/,
  );
});

test("image attachments retain their MIME type and bytes for private previews", async () => {
  for (const [mime, extension] of [
    ["image/jpeg", "jpg"],
    ["image/png", "png"],
    ["image/webp", "webp"],
  ] as const) {
    const imageFilename = `inspiration-${reference}.${extension}`;
    const bytes = new Uint8Array([0, 1, 127, 128, 255]);
    const result = await fetchAttachment(reference, new AbortController().signal, async () => new Response(bytes, {
      headers: { "Content-Type": mime, "Content-Disposition": `attachment; filename="${imageFilename}"` },
    }));
    assert.equal(result.filename, imageFilename);
    assert.equal(result.blob.type, mime);
    assert.deepEqual(new Uint8Array(await result.blob.arrayBuffer()), bytes);
  }
});

test("active document types cannot be previewed despite a valid attachment filename", async () => {
  for (const [mime, body] of [
    ["image/svg+xml", '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'],
    ["text/html", "<html>Sign in</html>"],
  ] as const) {
    await assert.rejects(
      fetchAttachment(reference, new AbortController().signal, async () => new Response(body, {
        headers: { "Content-Type": mime, "Content-Disposition": `attachment; filename="inspiration-${reference}.jpg"` },
      })),
      (error: unknown) => error instanceof AttachmentDownloadError && /could not be loaded/.test(error.message),
    );
  }
});
