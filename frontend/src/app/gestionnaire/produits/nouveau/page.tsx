import Link from "next/link";
import { ManagerProductForm } from "@/components/manager/manager-product-form";
import { DataLoadAlert } from "@/components/ui/data-load-alert";
import { WorkspacePageHeader } from "@/components/workspace/workspace-page-header";
import { getPublicCategories } from "@/lib/api/catalog";

export const dynamic = "force-dynamic";

export default async function NewManagerProductPage() {
  let categories: Awaited<ReturnType<typeof getPublicCategories>> | null = null;

  try {
    categories = await getPublicCategories();
  } catch {
    categories = null;
  }

  return (
    <>
      <WorkspacePageHeader
        eyebrow="Gestion"
        title="Ajouter un produit"
        description="Creez un nouveau produit dans le catalogue SONACOS."
        breadcrumbs={[
          { label: "Gestion" },
          { label: "Produits" },
          { label: "Ajouter" },
        ]}
        actions={
          <Link href="/gestionnaire/produits" className="button-secondary">
            Retour aux produits
          </Link>
        }
      />

      {categories ? (
        <ManagerProductForm mode="create" categories={categories} />
      ) : (
        <DataLoadAlert
          description="Les categories n'ont pas pu etre chargees."
          retryHref="/gestionnaire/produits/nouveau"
        />
      )}
    </>
  );
}
