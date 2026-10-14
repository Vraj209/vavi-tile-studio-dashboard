"use client";

import { useFormStatus } from "react-dom";

export function FilterSubmit() {
  const { pending } = useFormStatus();
  return <button className="button filter-submit" type="submit" disabled={pending} aria-busy={pending}>
    {pending ? "Applying…" : "Apply filters"}
  </button>;
}
