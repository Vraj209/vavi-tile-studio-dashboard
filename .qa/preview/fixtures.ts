import {
  ENQUIRIES_PAGE_SIZE,
  normalizeEnquiryFilters,
  type EnquiryDetail,
  type EnquiryFilterInput,
  type EnquiryList,
  type EnquiryStats,
} from "@/lib/enquiry-types";

// Synthetic data only. This module deliberately has no database or auth imports.
const referenceTime = Date.now();
const day = 24 * 60 * 60 * 1000;
const names = [
  "Avery North", "Morgan Reed", "Alexandria Montgomery-Wellington",
  "Theo Linden", "Jordan Vale", "Harper West", "Emery Brook", "Riley Stone",
  "Sage Ellis", "Finley Moss", "Casey Rowan", "Drew Ash", "Quinn Lane",
  "Robin Alder", "Reese Lake", "Blair Fern", "Jamie Grove", "Cameron Hill",
  "Taylor Elm", "Ellis Park", "Parker Dale", "Skyler Birch",
];
const projectTypes = ["Residential", "Commercial", "Hospitality", "Art & collaboration", "Not sure yet"];
const applications = ["Feature wall", "Kitchen", "Bathroom", "Commercial space", "Art installation"];

export const fixtureEnquiries: EnquiryDetail[] = names.map((name, index) => {
  const missingOptional = index === 1;
  const hasAttachment = index % 3 === 0;
  const idea = index === 0
    ? "We are exploring a botanical feature wall for a reading room. We like soft forest tones and a matte ceramic finish.\n\nThe approximate wall is 3.2 × 2.4 metres. Please advise on tile dimensions, lead time and how the artwork is prepared. This is a synthetic test enquiry."
    : index === 2
      ? "I’m interested in a tile from the studio brochure for our space. We would like to discuss a detailed, hand-drawn landscape with muted colours and understand how it could be adapted across a wider wall. This deliberately longer synthetic brief checks line wrapping and reading comfort without using real customer information."
      : `We would like to discuss a ${applications[index % applications.length].toLowerCase()} with the studio. Please get in touch to explore materials and suitable dimensions. Synthetic test enquiry ${index + 1}.`;
  return {
    reference: `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
    receivedAt: new Date(referenceTime - index * 2 * day - 60 * 60 * 1000).toISOString(),
    name,
    email: `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@example.test`,
    company: missingOptional ? "" : index === 2 ? "Montgomery-Wellington Architecture & Interior Design Studio (Test)" : index % 2 === 0 ? "Example Interiors" : "",
    projectType: missingOptional ? "" : projectTypes[index % projectTypes.length],
    application: missingOptional ? "" : applications[index % applications.length],
    location: missingOptional ? "" : index % 2 === 0 ? "Canada" : "United Kingdom",
    idea,
    ideaPreview: idea.slice(0, 180),
    hasAttachment,
    dimensions: missingOptional ? "" : "3.2 × 2.4 metres",
    phone: missingOptional ? "" : "+1 416 555 0100",
    desiredDate: missingOptional ? null : "2027-02-15",
    inspiration: hasAttachment ? {
      originalName: index === 0 ? "Synthetic tile composition.png" : `Synthetic-test-brief-${index + 1}-a-long-filename-to-check-responsive-attachment-layout-and-wrapping.${index === 3 ? "png" : "pdf"}`,
      mime: index === 0 || index === 3 ? "image/png" : "application/pdf",
      bytes: 215_040 + index * 1024,
    } : null,
  };
});

export function fixtureStats(items = fixtureEnquiries): EnquiryStats {
  return {
    total: items.length,
    last7Days: items.filter((item) => Date.parse(item.receivedAt) >= referenceTime - 7 * day).length,
    last30Days: items.filter((item) => Date.parse(item.receivedAt) >= referenceTime - 30 * day).length,
    withAttachments: items.filter((item) => item.hasAttachment).length,
  };
}

export function fixtureList(input: EnquiryFilterInput = {}, source = fixtureEnquiries): EnquiryList {
  const filters = normalizeEnquiryFilters(input);
  const items = source.filter((item) => {
    const haystack = [item.name, item.email, item.phone, item.company, item.location, item.projectType, item.application, item.idea, item.reference].join(" ").toLowerCase();
    return (!filters.q || haystack.includes(filters.q.toLowerCase()))
      && (!filters.projectType || item.projectType === filters.projectType)
      && (filters.attachment !== "with" || item.hasAttachment)
      && (filters.period === "all" || Date.parse(item.receivedAt) >= referenceTime - (filters.period === "7d" ? 7 : 30) * day);
  }).sort((a, b) => {
    const direction = filters.sort === "oldest" ? 1 : -1;
    return direction * (Date.parse(a.receivedAt) - Date.parse(b.receivedAt) || a.reference.localeCompare(b.reference));
  });
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / ENQUIRIES_PAGE_SIZE));
  const page = Math.min(filters.page, totalPages);
  return {
    items: items.slice((page - 1) * ENQUIRIES_PAGE_SIZE, page * ENQUIRIES_PAGE_SIZE),
    total, page, pageSize: ENQUIRIES_PAGE_SIZE, totalPages, filters: { ...filters, page },
  };
}
