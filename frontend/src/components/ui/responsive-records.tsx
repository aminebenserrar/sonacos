import type { ReactNode } from "react";

type ResponsiveRecordsProps<T> = {
  items: T[];
  empty: ReactNode;
  desktop: ReactNode;
  renderMobileCard: (item: T) => ReactNode;
};

export function ResponsiveRecords<T>({
  items,
  empty,
  desktop,
}: ResponsiveRecordsProps<T>) {
  if (items.length === 0) {
    return empty;
  }

  return <div className="w-full overflow-x-auto">{desktop}</div>;
}
