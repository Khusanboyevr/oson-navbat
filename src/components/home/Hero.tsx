"use client";

import { Search } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface HeroProps {
  query: string;
  onQueryChange: (query: string) => void;
}

export default function Hero({ query, onQueryChange }: HeroProps) {
  const { t } = useLanguage();

  const handleSearch = () => {
    document.getElementById("top-ustalar")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/30 bg-white/20 p-8 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-xl sm:p-12">
      <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
          {t("hero.titleMain")} <span className="text-primary">{t("hero.titleAccent")}</span>
        </h1>
        <p className="max-w-md text-sm text-muted-foreground sm:text-base">{t("hero.subtitle")}</p>

        <div className="flex w-full flex-col items-stretch gap-2 rounded-2xl border border-white/40 bg-white/50 p-2 shadow-sm backdrop-blur-md sm:flex-row sm:items-center sm:p-2.5">
          <div className="flex flex-1 items-center gap-2 px-2">
            <Search size={20} className="shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              type="text"
              placeholder={t("hero.searchPlaceholder")}
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none sm:text-base"
            />
          </div>
          <button
            type="button"
            onClick={handleSearch}
            className="shrink-0 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-primary-hover hover:shadow-md active:scale-95"
          >
            {t("hero.searchButton")}
          </button>
        </div>
      </div>
    </section>
  );
}
