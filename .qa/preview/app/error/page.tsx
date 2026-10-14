"use client";

import OwnerError from "@/app/(owner)/error";

export default function ErrorFixture() {
  return <OwnerError retry={() => window.location.reload()} />;
}
