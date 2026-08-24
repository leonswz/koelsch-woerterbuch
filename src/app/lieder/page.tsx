import type { Metadata } from "next";
import { EmptyList } from "@/components/empty-list";

export const metadata: Metadata = { title: "Karnevalslieder" };

export default function LiederPage() {
  return (
    <EmptyList
      title="Karnevalslieder"
      text="Hier kommen die Liedtexte mit deutscher Übersetzung – von Brings bis Bläck Fööss."
    />
  );
}
