import { EnquiryInbox } from "@/components/EnquiryInbox";
import { fixtureList, fixtureStats } from "../../fixtures";

export default function EmptyFixture() {
  return <EnquiryInbox result={fixtureList({}, [])} stats={fixtureStats([])} />;
}
