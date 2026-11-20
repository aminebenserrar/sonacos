import type { ReactNode } from "react";

type MobileDataField = {
  label: string;
  value: ReactNode;
};

type MobileDataCardProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  badges?: ReactNode;
  description?: ReactNode;
  fields?: MobileDataField[];
  actions?: ReactNode;
};

export function MobileDataCard({
  title,
  subtitle,
  badges,
  description,
  fields,
  actions,
}: MobileDataCardProps) {
  return (
    <article className="mobile-data-card">
      {badges ? <div className="flex flex-wrap gap-2">{badges}</div> : null}

      <div className={badges ? "mt-4" : ""}>
        <h3 className="text-base font-semibold text-brand-strong">{title}</h3>
        {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
        {description ? (
          <div className="mt-3 text-sm leading-6 text-muted">{description}</div>
        ) : null}
      </div>

      {fields?.length ? (
        <div className="mobile-data-grid">
          {fields.map((field) => (
            <div key={field.label} className="mobile-data-field">
              <p className="mobile-data-label">{field.label}</p>
              <div className="mobile-data-value">{field.value}</div>
            </div>
          ))}
        </div>
      ) : null}

      {actions ? <div className="mt-4 flex flex-wrap gap-2">{actions}</div> : null}
    </article>
  );
}
