import type { ReactNode } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { ClipboardIcon } from "@/components/ui/store-icons";
import { StatusBadge } from "@/components/ui/status-badge";

type DataListCardItem = {
  id?: string | number;
  title: string;
  subtitle?: string;
  value?: string;
  status?: string;
};

type DataListCardProps = {
  title: string;
  items: DataListCardItem[];
  emptyMessage?: string;
  action?: ReactNode;
};

export function DataListCard({
  title,
  items,
  emptyMessage = "Aucune donnée disponible pour le moment.",
  action,
}: DataListCardProps) {
  return (
    <div className="action-list-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-[1.35rem] font-semibold text-brand-strong">
          {title}
        </h2>
        {action ? <div className="flex flex-wrap gap-2">{action}</div> : null}
      </div>

      {items.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={<ClipboardIcon className="h-5 w-5" />}
            title="Aucun résultat"
            description={emptyMessage}
          />
        </div>
      ) : (
        <div className="mt-4 divide-y divide-line">
          {items.map((item, index) => (
            <div
              key={item.id ?? `${item.title}-${item.subtitle ?? ""}-${item.value ?? ""}-${index}`}
              className="list-row"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-brand-strong">{item.title}</p>
                {item.subtitle ? (
                  <p className="mt-1 text-sm leading-6 text-muted">{item.subtitle}</p>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                {item.value ? (
                  <span className="text-sm font-semibold text-brand">{item.value}</span>
                ) : null}
                {item.status ? <StatusBadge value={item.status} /> : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
