import { formatRoleLabel, formatStatusLabel } from "@/lib/formatters";

type StatusBadgeProps = {
  value: string;
  kind?: "status" | "role" | "priority";
};

function getTone(value: string, kind: StatusBadgeProps["kind"]) {
  const normalized = value.toUpperCase();

  if (kind === "role") {
    if (normalized === "ADMIN") {
      return "border-brand/20 bg-brand/10 text-brand";
    }
    if (normalized === "RESPONSABLE") {
      return "border-accent/35 bg-accent-soft/70 text-brand-strong";
    }
    if (normalized === "GESTIONNAIRE") {
      return "border-sky-200 bg-sky-50 text-sky-700";
    }
    if (normalized === "ARCHIVISTE") {
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }
    if (normalized === "AUDITEUR") {
      return "border-violet-200 bg-violet-50 text-violet-700";
    }
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (kind === "priority") {
    if (normalized === "HAUTE") {
      return "border-danger/20 bg-danger/10 text-danger";
    }
    if (normalized === "MOYENNE") {
      return "border-amber-200 bg-amber-50 text-amber-700";
    }
    return "border-brand/15 bg-brand/8 text-brand";
  }

  if (
    [
      "VALIDE",
      "VALIDEE",
      "LIVREE",
      "ACTIF",
      "DISPONIBLE",
      "ARCHIVE",
      "INFORMATION",
    ].includes(normalized)
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (["EN_PREPARATION", "PRETE", "EXPEDIEE", "CONFIRMEE"].includes(normalized)) {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }

  if (
    ["ANNULEE", "REFUSEE", "REFUSE", "RUPTURE", "INACTIF", "SENSIBLE"].includes(
      normalized,
    )
  ) {
    return "border-danger/20 bg-danger/10 text-danger";
  }

  if (normalized === "STOCK_FAIBLE" || normalized === "IMPORTANT" || normalized === "A_ARCHIVER") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

export function StatusBadge({ value, kind = "status" }: StatusBadgeProps) {
  const label = kind === "role" ? formatRoleLabel(value) : formatStatusLabel(value);

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.14em] uppercase ${getTone(value, kind)}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
