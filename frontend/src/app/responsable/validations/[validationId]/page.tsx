import Link from "next/link";
import { redirect } from "next/navigation";
import { ResponsableValidationDetailPage } from "@/components/responsable/responsable-validation-detail-page";
import { DataLoadAlert } from "@/components/ui/data-load-alert";
import { EmptyState } from "@/components/ui/empty-state";
import { ClipboardIcon } from "@/components/ui/store-icons";
import { getResponsableValidation } from "@/lib/api/validation";
import { isApiClientError } from "@/lib/api/http";
import { getSessionToken, requireSession } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

type ResponsableValidationDetailRouteProps = {
  params: Promise<{ validationId: string }>;
  searchParams: Promise<{ returnTo?: string }>;
};

function resolveReturnHref(returnTo: string | undefined) {
  if (returnTo?.startsWith("/responsable/validations")) {
    return returnTo;
  }

  return "/responsable/validations";
}

export default async function ResponsableValidationDetailRoute({
  params,
  searchParams,
}: ResponsableValidationDetailRouteProps) {
  await requireSession(["RESPONSABLE"]);
  const { validationId } = await params;
  const query = await searchParams;
  const token = await getSessionToken();
  const backHref = resolveReturnHref(query.returnTo);
  const id = Number(validationId);

  if (!token) {
    redirect("/login");
  }

  if (!Number.isFinite(id)) {
    return (
      <EmptyState
        icon={<ClipboardIcon className="h-5 w-5" />}
        title="Demande introuvable"
        description="Cette demande n'existe pas ou n'est plus disponible."
        action={
          <Link href={backHref} className="button-primary">
            Retour aux validations
          </Link>
        }
      />
    );
  }

  let validation;
  try {
    validation = await getResponsableValidation(token, id);
  } catch (error) {
    if (isApiClientError(error) && error.status === 404) {
      return (
        <EmptyState
          icon={<ClipboardIcon className="h-5 w-5" />}
          title="Demande introuvable"
          description="Cette demande n'existe pas ou n'est plus disponible."
          action={
            <Link href={backHref} className="button-primary">
              Retour aux validations
            </Link>
          }
        />
      );
    }

    return (
      <DataLoadAlert
        description="Impossible de charger le detail de la demande."
        retryHref={`/responsable/validations/${id}?returnTo=${encodeURIComponent(backHref)}`}
      />
    );
  }

  return <ResponsableValidationDetailPage initialValidation={validation} backHref={backHref} />;
}
