import Link from "next/link";
import { AttachmentDownload } from "@/components/AttachmentDownload";
import { AttachmentPreview } from "@/components/AttachmentPreview";
import { enquiryListHref, type EnquiryDetail, type EnquiryFilterInput } from "@/lib/enquiry-types";

function display(value: string | null | undefined) {
  return value?.trim() || "Not provided";
}

function formatDate(value: string, dateOnly = false) {
  return new Intl.DateTimeFormat("en-CA", {
    day: "numeric", month: "long", year: "numeric",
    ...(!dateOnly && { hour: "numeric", minute: "2-digit", timeZoneName: "short" }),
    timeZone: dateOnly ? "UTC" : "America/Toronto",
  }).format(new Date(dateOnly ? `${value}T00:00:00Z` : value));
}

function fileSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function EnquiryDetailView({ inquiry, filters = {} }: { inquiry: EnquiryDetail; filters?: EnquiryFilterInput }) {
  const phoneHref = inquiry.phone.replace(/[^+\d]/g, "");
  const emailHref = `mailto:${encodeURIComponent(inquiry.email)}?subject=${encodeURIComponent("Your VAVI Tile Studio enquiry")}`;
  const projectFields = [
    ["Project type", display(inquiry.projectType)],
    ["Application", display(inquiry.application)],
    ["Location", display(inquiry.location)],
    ["Dimensions / area", display(inquiry.dimensions)],
    ["Desired date", inquiry.desiredDate ? formatDate(inquiry.desiredDate, true) : "Not provided"],
  ];

  return (
    <>
      <Link href={enquiryListHref(filters)} className="back-link"><span aria-hidden="true">←</span>Back to enquiries</Link>
      <div className="page-heading detail-heading">
        <div>
          <span className="eyebrow">PROJECT ENQUIRY</span>
          <h1>{inquiry.name}</h1>
          <p>Received <time dateTime={inquiry.receivedAt}>{formatDate(inquiry.receivedAt)}</time></p>
        </div>
        <a className="button" href={emailHref}>Reply by email<span aria-hidden="true">↗</span></a>
      </div>
      <div className="detail-layout">
        <div className="detail-main">
          <section className="detail-panel" aria-labelledby="brief-heading">
            <div className="panel-heading"><h2 id="brief-heading">The project brief</h2></div>
            <p className="project-brief">{inquiry.idea}</p>
          </section>
          <section className="detail-panel" aria-labelledby="project-heading">
            <div className="panel-heading"><h2 id="project-heading">Project details</h2></div>
            <dl className="detail-grid">
              {projectFields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
            </dl>
          </section>
          <section className="detail-panel" aria-labelledby="inspiration-heading">
            <div className="panel-heading"><h2 id="inspiration-heading">Inspiration</h2></div>
            {inquiry.inspiration ? (
              <>
                {["image/jpeg", "image/png", "image/webp"].includes(inquiry.inspiration.mime) ? (
                  <AttachmentPreview key={inquiry.reference} reference={inquiry.reference} filename={inquiry.inspiration.originalName} />
                ) : null}
                <div className="attachment-file">
                  <span className="file-monogram" aria-hidden="true">{inquiry.inspiration.mime === "application/pdf" ? "PDF" : "IMG"}</span>
                  <div className="attachment-description"><strong>{inquiry.inspiration.originalName}</strong><span>{fileSize(inquiry.inspiration.bytes)} · Private attachment</span></div>
                  <AttachmentDownload reference={inquiry.reference} filename={inquiry.inspiration.originalName} />
                </div>
              </>
            ) : <p className="muted">No inspiration file was attached to this enquiry.</p>}
          </section>
        </div>
        <aside className="detail-aside">
          <section className="detail-panel contact-panel" aria-labelledby="contact-heading">
            
            <h2 id="contact-heading">Contact details</h2>
            <dl className="contact-details">
              <div><dt>Name</dt><dd>{inquiry.name}</dd></div>
              <div><dt>Email address</dt><dd><a className="text-link" href={emailHref}>{inquiry.email}</a></dd></div>
              <div><dt>Phone</dt><dd>{phoneHref ? <a className="text-link" href={`tel:${phoneHref}`}>{inquiry.phone}</a> : display(inquiry.phone)}</dd></div>
              <div><dt>Company / studio</dt><dd>{display(inquiry.company)}</dd></div>
            </dl>
          </section>
          <section className="reference-panel" aria-labelledby="reference-heading">
            <h2 id="reference-heading">Enquiry reference</h2>
            <code>{inquiry.reference}</code>
            <p>Submitted through the studio website.</p>
          </section>
        </aside>
      </div>
    </>
  );
}

