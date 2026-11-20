import {
  AlertIcon,
  CartIcon,
  CheckCircleIcon,
  CreditCardIcon,
  PackageIcon,
  SparklesIcon,
  UsersIcon,
} from "@/components/ui/store-icons";

type Metric = {
  label: string;
  value: string;
  detail: string;
  icon?: "cart" | "payments" | "stock" | "check" | "products" | "users" | "chart";
};

type MetricGridProps = {
  items: Metric[];
};

export function MetricGrid({ items }: MetricGridProps) {
  const iconMap = {
    cart: CartIcon,
    payments: CreditCardIcon,
    stock: AlertIcon,
    check: CheckCircleIcon,
    products: PackageIcon,
    users: UsersIcon,
    chart: SparklesIcon,
  } as const;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon ? iconMap[item.icon] : null;

        return (
          <div key={item.label} className="kpi-card flex min-h-[150px] flex-col justify-between">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted">{item.label}</p>
                <p className="mt-3 font-heading text-[1.85rem] font-semibold tracking-[-0.04em] text-brand-strong">
                  {item.value}
                </p>
              </div>
              {Icon ? (
                <div className="flex h-11 w-11 items-center justify-center rounded-[12px] border border-brand/10 bg-brand-soft text-brand">
                  <Icon className="h-5 w-5" />
                </div>
              ) : null}
            </div>
            <p className="mt-5 text-sm leading-6 text-muted">{item.detail}</p>
          </div>
        );
      })}
    </div>
  );
}
