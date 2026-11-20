import Link from "next/link";
import { AuditJournalTable } from "@/components/auditeur/audit-journal-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { ClipboardIcon } from "@/components/ui/store-icons";
import { WorkspacePageHeader } from "@/components/workspace/workspace-page-header";
import { getAdminActivity } from "@/lib/api/admin";
import { getSessionToken } from "@/lib/auth/guards";
import { parsePaginationPage, parsePaginationSize } from "@/lib/pagination";

type AdminActivityPageProps = {
  searchParams: Promise<{
    query?: string;
    user?: string;
    role?: string;
    actionType?: string;
    module?: string;
    level?: string;
    date?: string;
    page?: string;
    size?: string;
  }>;
};

export const dynamic = "force-dynamic";

function buildActivityHref(page: number, filters: Record<string, string | undefined>) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  params.set("page", String(page));
  return `/admin/activite?${params.toString()}`;
}

function buildCurrentActivityHref(
  currentPage: number,
  filters: Record<string, string | undefined>,
) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  if (currentPage > 1) {
    params.set("page", String(currentPage));
  }

  const queryString = params.toString();

  return queryString ? `/admin/activite?${queryString}` : "/admin/activite";
}

export default async function AdminActivityPage({ searchParams }: AdminActivityPageProps) {
  const params = await searchParams;
  const currentPage = parsePaginationPage(params.page);
  const pageSize = parsePaginationSize(params.size);
  const token = await getSessionToken();
  let journal = null;
  let loadError = false;

  if (token) {
    try {
      journal = await getAdminActivity(token, {
        page: currentPage - 1,
        size: pageSize,
        query: params.query?.trim() || undefined,
        user: params.user?.trim() || undefined,
        role: params.role || undefined,
        actionType: params.actionType || undefined,
        module: params.module || undefined,
        level: params.level || undefined,
        date: params.date || undefined,
      });
    } catch {
      loadError = true;
    }
  }

  const filters = {
    query: params.query?.trim() || undefined,
    user: params.user?.trim() || undefined,
    role: params.role || undefined,
    actionType: params.actionType || undefined,
    module: params.module || undefined,
    level: params.level || undefined,
    date: params.date || undefined,
    size: pageSize === 20 ? undefined : String(pageSize),
  };
  const returnTo = buildCurrentActivityHref(currentPage, filters);

  return (
    <>
      <WorkspacePageHeader
        eyebrow="Administration"
        title="Journal d'activite"
        description="Consultez les actions sensibles, les creations de comptes et les modifications effectuees dans la plateforme."
        breadcrumbs={[
          { label: "Administration" },
          { label: "Journal d'activite" },
        ]}
      />

      <div className="card p-6">
        <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          {pageSize !== 20 ? <input type="hidden" name="size" value={pageSize} /> : null}
          <input
            type="text"
            name="query"
            defaultValue={params.query ?? ""}
            className="form-control mt-0 xl:col-span-2"
            placeholder="Rechercher une action, un utilisateur ou une ressource"
            aria-label="Rechercher dans le journal d'activite"
          />
          <input
            type="text"
            name="user"
            defaultValue={params.user ?? ""}
            className="form-control mt-0"
            placeholder="Utilisateur ou e-mail"
            aria-label="Filtrer par utilisateur"
          />
          <select name="role" defaultValue={params.role ?? ""} className="form-control mt-0">
            <option value="">Tous les roles</option>
            <option value="ADMIN">Administrateur</option>
            <option value="GESTIONNAIRE">Gestionnaire</option>
            <option value="RESPONSABLE">Responsable</option>
            <option value="ARCHIVISTE">Archiviste</option>
            <option value="AUDITEUR">Auditeur</option>
            <option value="CLIENT">Client</option>
          </select>
          <select
            name="actionType"
            defaultValue={params.actionType ?? ""}
            className="form-control mt-0"
          >
            <option value="">Toutes les actions</option>
            <option value="CREATE_USER">Creation utilisateur</option>
            <option value="UPDATE_USER">Modification utilisateur</option>
            <option value="UPDATE_USER_ROLES">Modification des roles</option>
            <option value="ACTIVATE_USER">Activation compte</option>
            <option value="DEACTIVATE_USER">Desactivation compte</option>
            <option value="CHANGE_PASSWORD">Reinitialisation mot de passe</option>
          </select>
          <select name="module" defaultValue={params.module ?? ""} className="form-control mt-0">
            <option value="">Tous les modules</option>
            <option value="USER">Utilisateur</option>
            <option value="ORDER">Commande</option>
            <option value="PAYMENT">Paiement</option>
            <option value="INVOICE">Document</option>
            <option value="VALIDATION">Validation</option>
            <option value="STOCK">Stock</option>
          </select>
          <select name="level" defaultValue={params.level ?? ""} className="form-control mt-0">
            <option value="">Tous les niveaux</option>
            <option value="INFORMATION">Information</option>
            <option value="IMPORTANT">Important</option>
            <option value="SENSIBLE">Sensible</option>
          </select>
          <input
            type="date"
            name="date"
            defaultValue={params.date ?? ""}
            className="form-control mt-0"
            aria-label="Filtrer par date"
          />
          <div className="flex flex-wrap gap-3 xl:col-span-6">
            <button type="submit" className="button-primary">
              Filtrer
            </button>
            <Link href="/admin/activite" className="button-secondary">
              Reinitialiser
            </Link>
          </div>
        </form>

        <div className="table-shell mt-5">
          {loadError ? (
            <div className="p-6">
              <EmptyState
                icon={<ClipboardIcon className="h-5 w-5" />}
                title="Impossible de charger le journal d'activite"
                description="Le serveur n'a pas renvoye les operations d'administration."
                action={
                  <Link href="/admin/activite" className="button-primary">
                    Reessayer
                  </Link>
                }
              />
            </div>
          ) : !journal || journal.content.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<ClipboardIcon className="h-5 w-5" />}
                title="Aucune operation trouvee"
                description="Aucune operation ne correspond aux filtres actuels."
              />
            </div>
          ) : (
            <AuditJournalTable
              entries={journal.content}
              detailBasePath="/admin/activite"
              returnTo={returnTo}
            />
          )}
        </div>

        {journal ? (
          <Pagination
            currentPage={journal.page + 1}
            totalPages={journal.totalPages}
            pageSize={journal.size}
            totalItems={journal.totalElements}
            hrefForPage={(page) => buildActivityHref(page, filters)}
            hrefForPageSize={(size) =>
              buildActivityHref(1, { ...filters, size: size === 20 ? undefined : String(size) })
            }
            label="Pagination du journal d'activite"
          />
        ) : null}
      </div>
    </>
  );
}
