"use client";

import { XIcon } from "@/components/ui/store-icons";

type FilterSelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
};

type ActiveFilterChip = {
  key: string;
  label: string;
  value: string;
  onRemove: () => void;
};

type FilterBarProps = {
  children: React.ReactNode;
  resultLabel: string;
  activeCount?: number;
  onReset: () => void;
};

export function FilterSelect({ label, value, onChange, options }: FilterSelectProps) {
  const id = `filter-${label.toLowerCase().replaceAll(" ", "-")}`;

  return (
    <label htmlFor={id} className="grid gap-1.5 text-sm font-semibold text-brand-strong">
      <span className="sr-only">{label}</span>
      <select
        id={id}
        className="form-control mt-0 h-12"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function FilterBar({
  children,
  resultLabel,
  activeCount = 0,
  onReset,
}: FilterBarProps) {
  return (
    <div className="filter-toolbar">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="grid min-w-0 flex-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(320px,1.6fr)_repeat(3,minmax(180px,0.75fr))]">
          {children}
        </div>
        <button type="button" className="button-secondary h-12 w-full lg:w-auto" onClick={onReset}>
          Reinitialiser
        </button>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
        <p className="text-sm text-muted" aria-live="polite">
          {resultLabel}
        </p>
        {activeCount > 0 ? (
          <span className="rounded-full border border-brand/15 bg-brand/6 px-3 py-1 text-xs font-semibold text-brand-strong lg:hidden">
            Filtres ({activeCount})
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function ActiveFilterChips({
  chips,
  onClear,
}: {
  chips: ActiveFilterChip[];
  onClear: () => void;
}) {
  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Filtres actifs">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex min-h-9 items-center gap-2 rounded-full border border-brand/15 bg-brand/6 px-3 py-1 text-xs font-semibold text-brand-strong"
        >
          {chip.label}: {chip.value}
          <button
            type="button"
            className="inline-flex h-5 w-5 items-center justify-center rounded-full hover:bg-white"
            onClick={chip.onRemove}
            aria-label={`Supprimer le filtre ${chip.label}`}
          >
            <XIcon className="h-3 w-3" />
          </button>
        </span>
      ))}
      <button type="button" className="button-tertiary h-9 px-3 text-xs" onClick={onClear}>
        Tout effacer
      </button>
    </div>
  );
}
