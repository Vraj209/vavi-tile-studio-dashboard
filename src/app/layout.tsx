import type { Metadata } from "next";
import "@fontsource-variable/manrope/index.css";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "VAVI · Owner workspace", template: "%s · VAVI Owner" },
  description: "Private enquiry workspace for VAVI Tile Studio.",
  icons: {
    icon: { url: "/images/logo-transparent.png", type: "image/png" },
  },
  robots: { index: false, follow: false, nocache: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><a className="skip-link" href="#main">Skip to content</a>{children}</body></html>;
}

