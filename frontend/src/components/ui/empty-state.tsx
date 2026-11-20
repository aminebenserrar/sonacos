import type { ReactNode } from "react";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="rounded-[20px] border border-dashed border-line bg-white px-6 py-10 text-center shadow-[0_10px_30px_rgba(24,57,38,0.04)]">
      {icon ? (
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-strong text-brand">
          {icon}
        </div>
      ) : null}
      <h3 className="mt-4 font-heading text-xl font-bold text-brand-strong">
        {title}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
        {description}
      </p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
