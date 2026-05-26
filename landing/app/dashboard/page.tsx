import { redirect } from "next/navigation";
import { getMainAppUrl } from "@/lib/navigation";

export default function DashboardPage() {
  redirect(getMainAppUrl());
}
