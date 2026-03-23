"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { SupportedLocale } from "@/lib/i18n";

type LanguageSwitcherProps = {
  locale: SupportedLocale;
};

export function LanguageSwitcher({ locale }: LanguageSwitcherProps) {
  const router = useRouter();

  async function updateLocale(nextLocale: SupportedLocale) {
    await fetch("/api/preferences/language", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ locale: nextLocale })
    });

    router.refresh();
  }

  return (
    <div className="inline-flex rounded-full border border-line bg-white/5 p-1">
      {(["fr", "en"] as SupportedLocale[]).map((item) => (
        <Button
          key={item}
          size="sm"
          variant={locale === item ? "secondary" : "ghost"}
          className="h-8 min-w-10 rounded-full px-3 text-xs uppercase"
          onClick={() => updateLocale(item)}
        >
          {item}
        </Button>
      ))}
    </div>
  );
}
