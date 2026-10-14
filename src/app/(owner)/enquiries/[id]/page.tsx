import { notFound } from "next/navigation";
import { getEnquiry } from "@/lib/enquiries";
import { EnquiryDetailView } from "@/components/EnquiryDetailView";

export const dynamic = "force-dynamic";

export default async function InquiryPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ id }, filters] = await Promise.all([params, searchParams]);
  const inquiry = await getEnquiry(id);
  if (!inquiry) notFound();
  return <EnquiryDetailView inquiry={inquiry} filters={filters} />;
}
