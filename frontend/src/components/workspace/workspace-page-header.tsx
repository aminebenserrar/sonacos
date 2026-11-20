import type { ReactNode } from "react";

type PageHeaderBreadcrumb = {
  label: string;
};

type WorkspacePageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  breadcrumbs?: PageHeaderBreadcrumb[];
  actions?: ReactNode;
};

export function WorkspacePageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs,
  actions,
}: WorkspacePageHeaderProps) {
  return (
    <div className="page-header-surface">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          {breadcrumbs?.length ? (
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted">
              {breadcrumbs.map((breadcrumb, index) => (
                <span
                  key={`${breadcrumb.label}-${index}`}
                  className="inline-flex items-center gap-2"
                >
                  {index > 0 ? <span className="text-line">/</span> : null}
                  <span>{breadcrumb.label}</span>
                </span>
              ))}
            </div>
          ) : null}
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h1 className="font-heading text-[1.85rem] font-semibold tracking-[-0.04em] text-brand-strong md:text-[2.1rem]">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted md:text-base">
            {description}
          </p>
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </div>
  );
}
