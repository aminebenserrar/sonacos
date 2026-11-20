import Link from "next/link";
import { redirect } from "next/navigation";
import { AuditDetailPage } from "@/components/auditeur/audit-detail-page";
import { DataLoadAlert } from "@/components/ui/data-load-alert";
import { EmptyState } from "@/components/ui/empty-state";
import { ClipboardIcon } from "@/components/ui/store-icons";
import { getAuditeurJournalEntry } from "@/lib/api/auditeur";
import { isApiClientError } from "@/lib/api/http";
import { getSessionToken, requireSession } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

type AuditeurJournalDetailPageProps = {
  params: Promise<{ activityId: string }>;
  searchParams: Promise<{ returnTo?: string; auditId?: string }>;
};

function resolveReturnHref(returnTo: string | undefined) {
  if (returnTo?.startsWith("/auditeur/journal")) {
    return returnTo;
  }

  return "/auditeur/journal";
}

export default async function AuditeurJournalDetailPage({
  params,
  searchParams,
}: AuditeurJournalDetailPageProps) {
  await requireSession(["AUDITEUR"]);
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
        `/auditeur/journal/${legacyAuditId}?returnTo=${encodeURIComponent(backHref)}`,
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
    entry = await getAuditeurJournalEntry(token, auditId);
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
        retryHref={`/auditeur/journal/${auditId}?returnTo=${encodeURIComponent(backHref)}`}
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
