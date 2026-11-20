"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type PageSizeSelectProps = {
  value: number;
  options: number[];
  hrefs: Record<number, string>;
  storageKey?: string;
  compactLabel?: string;
};

export function PageSizeSelect({
  value,
  options,
  hrefs,
  storageKey = "sonacos-page-size",
  compactLabel = "/ page",
}: PageSizeSelectProps) {
  const router = useRouter();

  useEffect(() => {
    window.localStorage.setItem(storageKey, String(value));
  }, [storageKey, value]);

  return (
    <label className="flex items-center gap-2 text-sm font-semibold text-brand-strong">
      <span className="hidden sm:inline">Afficher</span>
      <select
        value={value}
        className="h-10 rounded-full border border-line bg-white px-3 text-sm font-semibold text-brand-strong outline-none transition hover:border-brand focus:border-brand focus:ring-2 focus:ring-brand/15"
        aria-label="Nombre d'elements par page"
        onChange={(event) => {
          const nextSize = Number(event.target.value);
          const href = hrefs[nextSize];

          if (href) {
            window.localStorage.setItem(storageKey, String(nextSize));
            router.push(href, { scroll: true });
          }
        }}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option} {compactLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
