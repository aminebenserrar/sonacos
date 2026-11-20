import Link from "next/link";
import type { ReactNode } from "react";

type DetailPageHeaderProps = {
  backHref: string;
  backLabel: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  badges?: ReactNode;
  actions?: ReactNode;
};

type DetailSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

type DetailFieldProps = {
  label: string;
  value: ReactNode;
};

export function DetailPageHeader({
  backHref,
  backLabel,
  eyebrow,
  title,
  subtitle,
  badges,
  actions,
}: DetailPageHeaderProps) {
  return (
    <section className="page-header-surface">
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-sm font-semibold text-brand transition hover:text-brand-strong"
      >
        <span aria-hidden="true">←</span>
        <span>{backLabel}</span>
      </Link>

      <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-2 font-heading text-[1.9rem] font-semibold tracking-[-0.04em] text-brand-strong md:text-[2.25rem]">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-3 text-base font-medium text-muted md:text-lg">{subtitle}</p>
          ) : null}
        </div>

        <div className="flex flex-col items-start gap-3 lg:items-end">
          {badges ? <div className="flex flex-wrap gap-2">{badges}</div> : null}
          {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
        </div>
      </div>
    </section>
  );
}

export function DetailSection({ title, description, children }: DetailSectionProps) {
  return (
    <section className="card p-6">
      <div className="panel-header">
        <h2 className="panel-title">{title}</h2>
        {description ? <p className="panel-copy">{description}</p> : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function DetailField({ label, value }: DetailFieldProps) {
  return (
    <div className="rounded-[16px] border border-line bg-surface-strong/60 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </p>
      <div className="mt-2 text-sm font-semibold leading-6 text-brand-strong md:text-base">
        {value}
      </div>
    </div>
  );
}

export function DetailPageSkeleton() {
  return (
    <div className="grid gap-6">
      <section className="page-header-surface animate-pulse">
        <div className="h-4 w-40 rounded-full bg-brand/10" />
        <div className="mt-5 h-3 w-28 rounded-full bg-brand/10" />
        <div className="mt-3 h-10 max-w-[24rem] rounded-[16px] bg-brand/10" />
        <div className="mt-4 h-5 max-w-[18rem] rounded-full bg-brand/10" />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <div className="card animate-pulse p-6">
          <div className="h-5 w-52 rounded-full bg-brand/10" />
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-24 rounded-[16px] bg-brand/8" />
            ))}
          </div>
        </div>
        <div className="card animate-pulse p-6">
          <div className="h-5 w-40 rounded-full bg-brand/10" />
          <div className="mt-5 grid gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-20 rounded-[16px] bg-brand/8" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
