import { Metadata } from "next";
import { CASmileBoardView } from "@/components/admin/today/ca-smile-board-view";

export const metadata: Metadata = {
  title: "CA Smile | Admin Panel",
  description: "CA Smile interactive horizontal calendar and patient status board",
};

export default function AdminTodayPage() {
  return <CASmileBoardView />;
}
