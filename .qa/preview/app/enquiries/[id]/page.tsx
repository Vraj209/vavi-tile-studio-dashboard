import { notFound } from "next/navigation";
import { EnquiryDetailView } from "@/components/EnquiryDetailView";
import type { EnquiryFilterInput } from "@/lib/enquiry-types";
import { fixtureEnquiries } from "../../../fixtures";

export default async function PreviewEnquiry({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<EnquiryFilterInput> }) {
  const { id } = await params;
  const inquiry = fixtureEnquiries.find((item) => item.reference === id);
  if (!inquiry) notFound();
  return <EnquiryDetailView inquiry={inquiry} filters={await searchParams} />;
}
