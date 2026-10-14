import { EnquiryInbox } from "@/components/EnquiryInbox";
import { getEnquiries, getEnquiryStats } from "@/lib/enquiries";

export const dynamic = "force-dynamic";

export default async function InquiriesPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const [result, stats] = await Promise.all([getEnquiries(params), getEnquiryStats()]);
  return <EnquiryInbox result={result} stats={stats} />;
}
