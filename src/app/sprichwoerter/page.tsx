import type { Metadata } from "next";
import { EmptyList } from "@/components/empty-list";

export const metadata: Metadata = { title: "Sprichwörter" };

export default function SprichwoerterPage() {
  return (
    <EmptyList
      title="Sprichwörter"
      text="Hier kommen die rheinischen Redensarten – und was sie wirklich bedeuten."
    />
  );
}
