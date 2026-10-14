"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AttachmentDownloadError, fetchAttachment } from "@/lib/attachment-download";

type PreviewState =
  | { status: "loading" }
  | { status: "ready"; url: string }
  | { status: "error"; message: string };

const unavailableMessage = "This image could not be previewed. Try again or use Download.";

/** Keep private image bytes in this component, never in the shared image optimizer. */
export function AttachmentPreview({ reference, filename }: { reference: string; filename: string }) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<PreviewState>({ status: "loading" });
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    let objectUrl: string | undefined;
    const timeout = window.setTimeout(() => controller.abort("timeout"), 30_000);

    async function loadPreview() {
      try {
        const { blob } = await fetchAttachment(reference, controller.signal);
        if (!active || controller.signal.aborted) return;
        if (!["image/jpeg", "image/png", "image/webp"].includes(blob.type)) {
          throw new Error("Unsupported preview format");
        }
        objectUrl = URL.createObjectURL(blob);
        setState({ status: "ready", url: objectUrl });
      } catch (error) {
        if (!active || (controller.signal.aborted && controller.signal.reason !== "timeout")) return;
        setState({
          status: "error",
          message: controller.signal.reason === "timeout"
            ? "The preview took too long to load. Please try again."
            : error instanceof AttachmentDownloadError ? error.message : unavailableMessage,
        });
      } finally {
        window.clearTimeout(timeout);
      }
    }

    void loadPreview();
    return () => {
      active = false;
      controller.abort();
      window.clearTimeout(timeout);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [reference, attempt]);

  return (
    <div className="attachment-preview" aria-busy={state.status === "loading"}>
      {state.status === "loading" ? (
        <div className="attachment-preview-placeholder" role="status">Loading image preview…</div>
      ) : state.status === "error" ? (
        <div className="attachment-preview-placeholder">
          <p className="action-feedback action-feedback-error" role="status">{state.message}</p>
          <button type="button" className="button button-secondary button-small" onClick={() => {
            setState({ status: "loading" });
            setAttempt(value => value + 1);
          }}>Retry preview</button>
        </div>
      ) : (
        <>
          <button type="button" className="attachment-preview-trigger" aria-label={`View larger image: ${filename}`} aria-haspopup="dialog" onClick={() => dialog.current?.showModal()}>
            {/* A browser-only blob URL preserves authenticated delivery without shared optimization. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={state.url} alt={`Inspiration: ${filename}`} onError={() => setState({ status: "error", message: unavailableMessage })} />
            <span>View larger<span aria-hidden="true">↗</span></span>
          </button>
          <dialog ref={dialog} className="attachment-preview-dialog" aria-labelledby={titleId}>
            <div className="attachment-preview-dialog-heading">
              <h2 id={titleId}>{filename}</h2>
              <button type="button" className="button button-secondary button-small" onClick={() => dialog.current?.close()} autoFocus>Close<span aria-hidden="true">×</span></button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={state.url} alt={`Inspiration: ${filename}`} />
          </dialog>
        </>
      )}
    </div>
  );
}
