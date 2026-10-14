"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AttachmentDownloadError, fetchAttachment } from "@/lib/attachment-download";

type DownloadState = { status: "idle" | "pending" | "success" } | { status: "error"; message: string };

export function AttachmentDownload({ reference, filename }: { reference: string; filename: string }) {
  const [state, setState] = useState<DownloadState>({ status: "idle" });
  const request = useRef<AbortController | null>(null);
  const feedbackId = useId();
  const pending = state.status === "pending";

  useEffect(() => () => request.current?.abort(), []);

  async function download() {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setState({ status: "pending" });
    const timeout = window.setTimeout(() => controller.abort("timeout"), 30_000);

    try {
      const attachment = await fetchAttachment(reference, controller.signal);
      if (controller.signal.aborted) return;

      const objectUrl = URL.createObjectURL(attachment.blob);
      try {
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = attachment.filename;
        document.body.appendChild(link);
        try {
          link.click();
        } finally {
          link.remove();
        }
      } finally {
        // Give the browser time to consume the URL before releasing the file bytes.
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1_000);
      }
      setState({ status: "success" });
    } catch (error) {
      if (controller.signal.aborted && controller.signal.reason !== "timeout") return;
      setState({
        status: "error",
        message: controller.signal.reason === "timeout"
          ? "The download took too long. Please try again."
          : error instanceof AttachmentDownloadError
            ? error.message
            : "This attachment could not be downloaded. Please try again.",
      });
    } finally {
      window.clearTimeout(timeout);
      if (request.current === controller) request.current = null;
    }
  }

  return (
    <div className="attachment-download">
      <button
        type="button"
        className="button button-secondary button-small"
        onClick={download}
        disabled={pending}
        aria-busy={pending}
        aria-label={pending ? `Downloading ${filename}` : `Download ${filename}`}
        aria-describedby={feedbackId}
      >
        {pending ? "Downloading…" : "Download"}<span aria-hidden="true">↓</span>
      </button>
      <p id={feedbackId} className={`action-feedback${state.status === "error" ? " action-feedback-error" : ""}`} role="status" aria-live="polite" aria-atomic="true">
        {state.status === "pending" ? "Preparing your file…" : state.status === "success" ? "Download started" : state.status === "error" ? state.message : ""}
      </p>
    </div>
  );
}
