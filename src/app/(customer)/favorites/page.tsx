import { Heart } from "lucide-react";
import type { Metadata } from "next";
import ScreenPlaceholder from "@/components/layout/ScreenPlaceholder";

export const metadata: Metadata = {
  title: "Sevimlilar",
};

export default function FavoritesPage() {
  return (
    <ScreenPlaceholder
      icon={Heart}
      title="Sevimlilar bo'sh"
      description="Yoqtirgan ustalaringizni saqlang va ularni bir bosishda toping."
    />
  );
}
