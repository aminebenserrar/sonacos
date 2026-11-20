import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRightIcon } from "@/components/ui/store-icons";

type ActionItem = {
  href: string;
  label: string;
  description: string;
  icon?: ReactNode;
};

type ActionListCardProps = {
  title: string;
  description?: string;
  items: ActionItem[];
};

export function ActionListCard({
  title,
  description,
  items,
}: ActionListCardProps) {
  return (
    <div className="action-list-card">
      <div className="mb-4">
        <h2 className="font-heading text-[1.35rem] font-semibold text-brand-strong">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
        ) : null}
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className="action-list-item group">
            <div className="flex min-w-0 items-start gap-3">
              {item.icon ? (
                <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-brand/10 bg-brand-soft text-brand">
                  {item.icon}
                </span>
              ) : null}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-brand-strong">{item.label}</p>
                <p className="mt-1 text-sm leading-6 text-muted">
                  {item.description}
                </p>
              </div>
            </div>
            <ChevronRightIcon className="h-4 w-4 shrink-0 text-muted transition group-hover:text-brand" />
          </Link>
        ))}
      </div>
    </div>
  );
}
