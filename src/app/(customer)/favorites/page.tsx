import { Heart } from "lucide-react";
import ScreenPlaceholder from "@/components/layout/ScreenPlaceholder";

export default function FavoritesPage() {
  return (
    <ScreenPlaceholder
      icon={Heart}
      title="Sevimlilar bo'sh"
      description="Yoqtirgan ustalaringizni saqlang va ularni bir bosishda toping."
    />
  );
}
