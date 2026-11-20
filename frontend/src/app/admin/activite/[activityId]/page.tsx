import Link from "next/link";
import { redirect } from "next/navigation";
import { AuditDetailPage } from "@/components/auditeur/audit-detail-page";
import { DataLoadAlert } from "@/components/ui/data-load-alert";
import { EmptyState } from "@/components/ui/empty-state";
import { ClipboardIcon } from "@/components/ui/store-icons";
import { getAdminActivityEntry } from "@/lib/api/admin";
import { isApiClientError } from "@/lib/api/http";
import { getSessionToken, requireSession } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

type AdminActivityDetailPageProps = {
  params: Promise<{ activityId: string }>;
  searchParams: Promise<{ returnTo?: string; auditId?: string }>;
};

function resolveReturnHref(returnTo: string | undefined) {
  if (returnTo?.startsWith("/admin/activite")) {
    return returnTo;
  }

  return "/admin/activite";
}

export default async function AdminActivityDetailPage({
  params,
  searchParams,
}: AdminActivityDetailPageProps) {
  await requireSession(["ADMIN"]);
  const { activityId } = await params;
  const query = await searchParams;
  const token = await getSessionToken();
  const backHref = resolveReturnHref(query.returnTo);
  const rawAuditId = activityId;
  const auditId = Number(rawAuditId);
  const legacyAuditId = Number(query.auditId);

  if (!token) {
    redirect("/login");
  }

  if (!Number.isFinite(auditId)) {
    if (Number.isFinite(legacyAuditId)) {
      redirect(
        `/admin/activite/${legacyAuditId}?returnTo=${encodeURIComponent(backHref)}`,
      );
    }

    return (
      <EmptyState
        icon={<ClipboardIcon className="h-5 w-5" />}
        title="Operation introuvable"
        description="Cette operation n'existe pas ou n'est plus disponible."
        action={
          <Link href={backHref} className="button-primary">
            Retour au journal
          </Link>
        }
      />
    );
  }

  let entry;
  try {
    entry = await getAdminActivityEntry(token, auditId);
  } catch (error) {
    if (isApiClientError(error) && error.status === 404) {
      return (
        <EmptyState
          icon={<ClipboardIcon className="h-5 w-5" />}
          title="Operation introuvable"
          description="Cette operation n'existe pas ou n'est plus disponible."
          action={
            <Link href={backHref} className="button-primary">
              Retour au journal
            </Link>
          }
        />
      );
    }

    return (
      <DataLoadAlert
        description="Impossible de charger le detail de l operation."
        retryHref={`/admin/activite/${auditId}?returnTo=${encodeURIComponent(backHref)}`}
      />
    );
  }

  return (
    <AuditDetailPage
      entry={entry}
      backHref={backHref}
      backLabel="Retour au journal"
      sectionLabel="Journal d audit"
    />
  );
}
