"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SignOutButton } from "@/components/SignOutButton";
import { BrandLogo } from "@/components/BrandLogo";

type OwnerShellProps = {
  children: ReactNode;
  user: { name?: string | null; email: string };
};

export function OwnerShell({ children, user }: OwnerShellProps) {
  const pathname = usePathname();
  const accountPage = pathname.startsWith("/account");
  const displayName = user.name?.trim() || user.email;

  return (
    <div className="owner-layout">
      <aside className="sidebar">
        <Link href="/" className="brand" aria-label="VAVI Tile Studio owner home">
          <BrandLogo />
        </Link>
        <div className="sidebar-section-label">STUDIO WORKSPACE</div>
        <nav className="primary-nav" aria-label="Main navigation">
          <Link href="/" aria-current={!accountPage ? "page" : undefined}>
            Enquiries
            {!accountPage && <span className="nav-indicator" aria-hidden="true" />}
          </Link>
          <Link href="/account" aria-current={accountPage ? "page" : undefined}>
            My account
          </Link>
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <span className="avatar" aria-hidden="true">{displayName.slice(0, 1).toUpperCase()}</span>
            <div className="sidebar-user-details">
              <strong>{displayName}</strong>
              <span>Owner access</span>
            </div>
          </div>
          <SignOutButton />
        </div>
      </aside>
      <div className="workspace">
        <header className="workspace-topbar">
          <span>Workspace <span className="topbar-separator" aria-hidden="true">/</span> {accountPage ? "My account" : pathname.startsWith("/enquiries/") ? "Enquiry details" : "Enquiries"}</span>
        </header>
        <main id="main" tabIndex={-1} className="workspace-main">{children}</main>
      </div>
    </div>
  );
}
