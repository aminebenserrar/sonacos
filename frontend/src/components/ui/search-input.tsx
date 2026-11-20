"use client";

import { useEffect, useRef } from "react";
import { SearchIcon, XIcon } from "@/components/ui/store-icons";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label?: string;
  loading?: boolean;
  debounceMs?: number;
};

export function SearchInput({
  value,
  onChange,
  placeholder,
  label = "Recherche",
  loading = false,
  debounceMs = 350,
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  function scheduleChange(nextValue: string) {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      onChange(nextValue);
    }, debounceMs);
  }

  return (
    <div className="group flex h-12 min-w-0 items-center gap-3 rounded-[14px] border border-line bg-white px-4 shadow-[0_3px_12px_rgba(24,57,38,0.04)] transition hover:border-brand/25 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10">
      <SearchIcon className="h-4 w-4 shrink-0 text-muted group-focus-within:text-brand" />
      <input
        key={value}
        ref={inputRef}
        type="search"
        defaultValue={value}
        onChange={(event) => scheduleChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            if (timeoutRef.current !== null) {
              window.clearTimeout(timeoutRef.current);
            }
            onChange(event.currentTarget.value);
          }
        }}
        placeholder={placeholder}
        aria-label={label}
        className="h-full min-w-0 flex-1 bg-transparent text-sm font-medium text-brand-strong outline-none placeholder:text-muted"
      />
      {loading ? (
        <span
          className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-line border-t-brand"
          aria-label="Recherche en cours"
        />
      ) : value ? (
        <button
          type="button"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted hover:bg-surface-strong hover:text-brand"
          onClick={() => {
            if (timeoutRef.current !== null) {
              window.clearTimeout(timeoutRef.current);
            }
            if (inputRef.current) {
              inputRef.current.value = "";
            }
            onChange("");
          }}
          aria-label="Effacer la recherche"
        >
          <XIcon className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}
