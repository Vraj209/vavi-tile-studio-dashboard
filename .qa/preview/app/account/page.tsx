import Link from "next/link";

export default function AccountFixture() {
  return <section className="detail-panel"><h1>Test account</h1><p>This isolated preview has no authentication or account management. OwnerShell navigation is shown with a synthetic identity.</p><Link className="text-link" href="/">Return to enquiries</Link></section>;
}
