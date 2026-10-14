export const ENQUIRIES_PAGE_SIZE = 20;

export const enquiryProjectTypes = [
  "Not sure yet",
  "Residential",
  "Commercial",
  "Hospitality",
  "Art & collaboration",
] as const;

export type EnquiryFilterInput = {
  q?: string | string[];
  projectType?: string | string[];
  period?: string | string[];
  attachment?: string | string[];
  sort?: string | string[];
  page?: string | string[] | number;
};

export type EnquiryFilters = {
  q: string;
  projectType: string;
  period: "all" | "7d" | "30d";
  attachment: "all" | "with";
  sort: "newest" | "oldest";
  page: number;
};

export type EnquirySummary = {
  reference: string;
  receivedAt: string;
  name: string;
  email: string;
  projectType: string;
  application: string;
  location: string;
  company: string;
  ideaPreview: string;
  hasAttachment: boolean;
};

export type EnquiryDetail = EnquirySummary & {
  idea: string;
  dimensions: string;
  phone: string;
  desiredDate: string | null;
  inspiration: {
    originalName: string;
    mime: string;
    bytes: number;
  } | null;
};

export type EnquiryList = {
  items: EnquirySummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  filters: EnquiryFilters;
};

export type EnquiryStats = {
  total: number;
  last7Days: number;
  last30Days: number;
  withAttachments: number;
};

function single(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export function normalizeEnquiryFilters(input: EnquiryFilterInput = {}): EnquiryFilters {
  const pageValue = typeof input.page === "number" ? String(input.page) : single(input.page);
  const page = /^\d{1,7}$/.test(pageValue) ? Number(pageValue) : 1;
  const period = single(input.period);
  return {
    q: single(input.q).replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, 200),
    projectType: single(input.projectType).trim().slice(0, 120),
    period: period === "7d" || period === "30d" ? period : "all",
    attachment: single(input.attachment) === "with" ? "with" : "all",
    sort: single(input.sort) === "oldest" ? "oldest" : "newest",
    page: Math.min(Math.max(page, 1), 1_000_000),
  };
}

/** The list and detail view share a bounded, local-only enquiry query context. */
export function enquiryListHref(input: EnquiryFilterInput = {}, page?: number): string {
  const filters = normalizeEnquiryFilters(page === undefined ? input : { ...input, page });
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.projectType) params.set("projectType", filters.projectType);
  if (filters.period !== "all") params.set("period", filters.period);
  if (filters.attachment !== "all") params.set("attachment", filters.attachment);
  if (filters.sort !== "newest") params.set("sort", filters.sort);
  if (filters.page > 1) params.set("page", String(filters.page));
  const query = params.toString();
  return query ? `/?${query}` : "/";
}
