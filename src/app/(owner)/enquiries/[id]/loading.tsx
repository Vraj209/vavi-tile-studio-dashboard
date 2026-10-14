export default function EnquiryLoading() {
  return <div aria-busy="true" aria-label="Loading enquiry">
    <span className="sr-only" role="status">Loading enquiry…</span>
    <div className="skeleton skeleton-eyebrow" />
    <div className="skeleton skeleton-title" />
    <div className="skeleton skeleton-subtitle" />
    <div className="detail-layout" aria-hidden="true">
      <div className="detail-main"><div className="skeleton skeleton-toolbar" /><div className="skeleton skeleton-stats" /><div className="skeleton skeleton-toolbar" /></div>
      <div className="skeleton skeleton-toolbar" />
    </div>
  </div>;
}
