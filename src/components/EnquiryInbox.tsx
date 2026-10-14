import Link from "next/link";
import Form from "next/form";
import { RefreshButton } from "@/components/RefreshButton";
import { FilterSubmit } from "@/components/FilterSubmit";
import { StudioSelect } from "@/components/StudioSelect";
import { enquiryListHref, enquiryProjectTypes, type EnquiryList, type EnquiryStats } from "@/lib/enquiry-types";

const dateFormat = new Intl.DateTimeFormat("en-CA", {
  day: "2-digit", month: "short", year: "numeric", timeZone: "America/Toronto",
});
const timeFormat = new Intl.DateTimeFormat("en-CA", {
  hour: "numeric", minute: "2-digit", timeZone: "America/Toronto",
});

export function EnquiryInbox({ result, stats }: { result: EnquiryList; stats: EnquiryStats }) {
  const { items, total, page, pageSize, totalPages, filters } = result;
  const filtered = Boolean(filters.q || filters.projectType || filters.period !== "all" || filters.attachment !== "all");
  const projectTypes = [...new Set<string>([...enquiryProjectTypes, ...(filters.projectType ? [filters.projectType] : [])])];
  const listHref = enquiryListHref(filters, page);
  const detailHref = (reference: string) => `/enquiries/${encodeURIComponent(reference)}${listHref.slice(1)}`;
  const metrics = [
    { label: "All enquiries", value: stats.total, note: "View the full inbox", href: "/" },
    { label: "Last 7 days", value: stats.last7Days, note: "View recent submissions", href: "/?period=7d" },
    { label: "With inspiration", value: stats.withAttachments, note: "View enquiries with a file", href: "/?attachment=with" },
  ];

  return <>
    <div className="page-heading">
      <div><span className="eyebrow">STUDIO WORKSPACE</span><h1>Enquiries</h1><p>Project briefs, customer details and the next conversation.</p></div>
      <RefreshButton />
    </div>
    <section className="metrics" aria-label="Overview of all enquiries">
      {metrics.map(({ label, value, note, href }) => <Link className="metric" key={label} href={href}>
        <span className="metric-label">{label}</span><strong>{value.toLocaleString("en-CA")}</strong><span className="metric-note">{note}<span aria-hidden="true"> →</span></span>
      </Link>)}
    </section>
    <section className="inbox" aria-labelledby="inbox-heading">
      <div className="section-heading"><h2 id="inbox-heading">{filtered ? "Filtered enquiries" : "All enquiries"}<span className="count-badge">{total.toLocaleString("en-CA")}</span></h2><span className="muted text-small">{filters.sort === "oldest" ? "Oldest first" : "Newest first"}</span></div>
      <div key={listHref}>
        <Form action="/" scroll={false} className="inbox-filters" role="search" aria-label="Search and filter enquiries">
          <div className="filter-search-row">
            <label className="field search-field" htmlFor="inquiry-search"><span>Search enquiries</span><input id="inquiry-search" name="q" type="search" placeholder="Name, email, project or reference" defaultValue={filters.q} maxLength={200} /></label>
            <FilterSubmit />
          </div>
          <div className="filter-options">
            <div className="field"><label htmlFor="project-type">Project type</label><StudioSelect id="project-type" name="projectType" label="Project type" defaultValue={filters.projectType} options={[{ value: "", label: "All project types" }, ...projectTypes.map((type) => ({ value: type, label: type }))]} /></div>
            <div className="field"><label htmlFor="received-period">Received</label><StudioSelect id="received-period" name="period" label="Received" defaultValue={filters.period} options={[{ value: "all", label: "Any time" }, { value: "7d", label: "Last 7 days" }, { value: "30d", label: "Last 30 days" }]} /></div>
            <div className="field"><label htmlFor="attachment-filter">Inspiration</label><StudioSelect id="attachment-filter" name="attachment" label="Inspiration" defaultValue={filters.attachment} options={[{ value: "all", label: "All enquiries" }, { value: "with", label: "With a file" }]} /></div>
            <div className="field"><label htmlFor="sort-order">Sort by</label><StudioSelect id="sort-order" name="sort" label="Sort by" defaultValue={filters.sort} options={[{ value: "newest", label: "Newest first" }, { value: "oldest", label: "Oldest first" }]} /></div>
          </div>
        </Form>
      </div>
      {filtered && <div className="filter-summary"><span>{total.toLocaleString("en-CA")} {total === 1 ? "enquiry matches" : "enquiries match"} your filters.</span><Link href="/" className="text-link">Clear filters</Link></div>}
      {items.length ? <>
        <div className="desktop-results">
          <table className="inquiry-table">
            <caption className="sr-only">Customer enquiries, {filters.sort === "oldest" ? "oldest" : "newest"} first. Times are in Toronto (ET).</caption>
            <thead><tr><th scope="col">Customer</th><th scope="col">Project</th><th scope="col">Received</th><th scope="col"><span className="sr-only">Open enquiry</span></th></tr></thead>
            <tbody>{items.map((inquiry) => <tr key={inquiry.reference}>
              <td><Link className="customer-name" href={detailHref(inquiry.reference)}>{inquiry.name}</Link><span className="table-secondary">{inquiry.company || inquiry.email}</span></td>
              <td><span className="project-type">{inquiry.projectType || "Not specified"}</span>{inquiry.hasAttachment && <span className="attachment-badge">1 file</span>}<span className="table-secondary">{inquiry.application || inquiry.location || "No additional details"}</span></td>
              <td className="date-cell"><time dateTime={inquiry.receivedAt}>{dateFormat.format(new Date(inquiry.receivedAt))}</time><span className="table-secondary">{timeFormat.format(new Date(inquiry.receivedAt))}</span></td>
              <td><Link className="open-inquiry" href={detailHref(inquiry.reference)} aria-label={`View enquiry from ${inquiry.name}`}>View <span aria-hidden="true">→</span></Link></td>
            </tr>)}</tbody>
          </table>
        </div>
        <ul className="mobile-results" aria-label="Enquiry results">
          {items.map((inquiry) => <li key={inquiry.reference}><Link className="enquiry-card" href={detailHref(inquiry.reference)}>
            <span className="card-topline"><strong>{inquiry.name}</strong><span aria-hidden="true">→</span></span>
            <span className="table-secondary">{inquiry.company || inquiry.email}</span>
            <span className="card-project">{inquiry.projectType || "Not specified"}{inquiry.hasAttachment && <span className="attachment-badge">1 file</span>}</span>
            <span className="card-preview">{inquiry.ideaPreview}</span>
            <time dateTime={inquiry.receivedAt}>{dateFormat.format(new Date(inquiry.receivedAt))} · {timeFormat.format(new Date(inquiry.receivedAt))}</time>
          </Link></li>)}
        </ul>
        <div className="pagination"><span>Showing {((page - 1) * pageSize + 1).toLocaleString("en-CA")}–{Math.min(page * pageSize, total).toLocaleString("en-CA")} of {total.toLocaleString("en-CA")}</span><nav className="pagination-controls" aria-label="Enquiry pages">
          {page > 1 ? <Link className="button button-secondary button-small" href={enquiryListHref(filters, page - 1)}>Previous</Link> : <button className="button button-secondary button-small" disabled>Previous</button>}
          <span>Page {page} of {totalPages}</span>
          {page < totalPages ? <Link className="button button-secondary button-small" href={enquiryListHref(filters, page + 1)}>Next</Link> : <button className="button button-secondary button-small" disabled>Next</button>}
        </nav></div>
      </> : <div className="empty-state" role="status"><h3>{filtered ? "No matching enquiries" : "No enquiries yet"}</h3><p>{filtered ? "Try another search or clear your filters to view the full inbox." : "Enquiries submitted through the studio website will appear here, along with the customer’s project brief and contact details."}</p>{filtered && <Link className="button button-secondary" href="/">Clear filters</Link>}</div>}
    </section>
  </>;
}
