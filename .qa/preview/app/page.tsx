import { EnquiryInbox } from "@/components/EnquiryInbox";
import type { EnquiryFilterInput } from "@/lib/enquiry-types";
import { fixtureList, fixtureStats } from "../fixtures";

export default async function PreviewInbox({ searchParams }: { searchParams: Promise<EnquiryFilterInput> }) {
  return <EnquiryInbox result={fixtureList(await searchParams)} stats={fixtureStats()} />;
}
