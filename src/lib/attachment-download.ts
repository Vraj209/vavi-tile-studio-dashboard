const unavailableMessage = "This attachment could not be loaded. Please try again.";

export class AttachmentDownloadError extends Error {}

/** Load private attachment bytes for preview or download without leaving the enquiry. */
export async function fetchAttachment(
  reference: string,
  signal: AbortSignal,
  fetcher: typeof fetch = fetch,
): Promise<{ blob: Blob; filename: string }> {
  let response: Response;
  try {
    response = await fetcher(`/api/enquiries/${encodeURIComponent(reference)}/attachment`, {
      credentials: "same-origin",
      cache: "no-store",
      redirect: "error",
      signal,
    });
  } catch {
    throw new AttachmentDownloadError("Could not connect to load the attachment. Please try again.");
  }

  if (!response.ok) {
    const message = response.status === 401
      ? "Your session has expired. Sign in again to view this attachment."
      : response.status === 403
        ? "Your account does not have permission to view this attachment."
        : response.status === 404
          ? "This attachment is no longer available."
          : response.status === 503
            ? "This attachment is temporarily unavailable. Please try again."
            : unavailableMessage;
    throw new AttachmentDownloadError(message);
  }

  // Only accept the private file response, never an HTML login or error page.
  const disposition = response.headers.get("content-disposition") ?? "";
  const filename = /^attachment; filename="(inspiration-[a-f0-9-]+\.(?:jpg|png|webp|pdf))"$/i.exec(disposition)?.[1];
  const contentType = response.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  if (!filename || !["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(contentType ?? "")) {
    throw new AttachmentDownloadError(unavailableMessage);
  }

  const blob = await response.blob();
  if (!blob.size) throw new AttachmentDownloadError(unavailableMessage);
  return { blob, filename };
}
