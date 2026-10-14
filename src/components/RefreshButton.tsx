"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function RefreshButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [requested, setRequested] = useState(false);

  return (
    <div className="refresh-control">
      <button
        type="button"
        className="button button-secondary"
        onClick={() => {
          if (pending) return;
          setRequested(true);
          startTransition(() => router.refresh());
        }}
        disabled={pending}
        aria-busy={pending}
      >
        <span aria-hidden="true">↻</span>{pending ? "Refreshing…" : "Refresh"}
      </button>
      <span className="action-feedback" role="status" aria-live="polite" aria-atomic="true">
        {pending ? "Checking for enquiries…" : requested ? "Refresh finished" : ""}
      </span>
    </div>
  );
}
