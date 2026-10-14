import { BrandLogo } from "@/components/BrandLogo";
import Image from "next/image";
import loginInterior from "../../public/images/login-ivory-interior.webp";

export default function AuthFrame({ title, description, children, showPanelCopy = true, showInterior = false, showPanelLogo = true }: {
  title: string; description: string; children: React.ReactNode; showPanelCopy?: boolean; showInterior?: boolean; showPanelLogo?: boolean;
}) {
  return <main id="main" tabIndex={-1} className={`auth-layout${showInterior ? " auth-layout-interior" : ""}`}>
    <aside className="auth-panel">
      {showInterior ? <Image
        src={loginInterior}
        alt=""
        fill
        className="auth-panel-image"
        sizes="(max-width: 767px) 1px, max(45vw, 66.67vh)"
        loading="lazy"
        fetchPriority="high"
      /> : null}
      {showPanelLogo && <div className="auth-brand"><BrandLogo /></div>}
      {showPanelCopy && <div className="auth-copy"><p className="eyebrow">THE OWNER WORKSPACE</p>
        <p className="auth-statement">A considered space<br />for every enquiry.</p>
        <p>Project briefs, contact details and inspiration. Together in your studio workspace.</p>
      </div>}
      {showPanelCopy && <p className="auth-footer">A private space for the VAVI team.</p>}
    </aside>
    <section className="auth-card" aria-labelledby="auth-title">
      <p className="eyebrow">VAVI OWNER</p><h1 id="auth-title">{title}</h1><p className="muted">{description}</p>
      {children}
    </section>
  </main>;
}
