import Link from "next/link";
import type { Metadata } from "next";
import { OwnerShell } from "@/components/OwnerShell";
import "@fontsource-variable/manrope/index.css";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "VAVI component QA · Synthetic fixtures",
  robots: { index: false, follow: false, nocache: true },
};

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>
    <a className="skip-link" href="#main">Skip to content</a>
    <div style={{ padding: "9px 16px", background: "#f4e4ba", color: "#362b12", fontSize: 12, borderBottom: "1px solid #8c763c", display: "flex", flexWrap: "wrap", gap: "8px 20px" }}>
      <strong>LOCAL QA · Synthetic test fixtures only · No production data or authentication</strong>
      <nav aria-label="QA fixture states" style={{ display: "flex", gap: 16 }}><Link href="/">Inbox</Link><Link href="/empty">Empty</Link><Link href="/error">Error</Link></nav>
    </div>
    <OwnerShell user={{ name: "Test owner", email: "owner@example.test" }}>{children}</OwnerShell>
  </body></html>;
}
