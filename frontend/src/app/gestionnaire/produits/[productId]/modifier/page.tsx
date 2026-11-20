import Link from "next/link";
import { ManagerProductForm } from "@/components/manager/manager-product-form";
import { DataLoadAlert } from "@/components/ui/data-load-alert";
import { EmptyState } from "@/components/ui/empty-state";
import { PackageIcon } from "@/components/ui/store-icons";
import { WorkspacePageHeader } from "@/components/workspace/workspace-page-header";
import { getManagedProducts, getPublicCategories } from "@/lib/api/catalog";
import { getSessionToken } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

type EditManagerProductPageProps = {
  params: Promise<{
    productId: string;
  }>;
};

export default async function EditManagerProductPage({
  params,
}: EditManagerProductPageProps) {
  const token = await getSessionToken();
  const { productId } = await params;
  const numericProductId = Number(productId);

  if (!Number.isFinite(numericProductId)) {
    return (
      <EmptyState
        icon={<PackageIcon className="h-5 w-5" />}
        title="Produit introuvable"
        description="L identifiant produit est invalide."
        action={
          <Link href="/gestionnaire/produits" className="button-primary">
            Retour aux produits
          </Link>
        }
      />
    );
  }

  let productsResponse: Awaited<ReturnType<typeof getManagedProducts>> | null = null;
  let categories: Awaited<ReturnType<typeof getPublicCategories>> | null = null;

  if (token) {
    const [productsResult, categoriesResult] = await Promise.allSettled([
      getManagedProducts(token, 0, 100),
      getPublicCategories(),
    ]);

    if (productsResult.status === "fulfilled") {
      productsResponse = productsResult.value;
    }

    if (categoriesResult.status === "fulfilled") {
      categories = categoriesResult.value;
    }
  }

  const product =
    productsResponse?.content.find((item) => item.id === numericProductId) ?? null;

  return (
    <>
      <WorkspacePageHeader
        eyebrow="Gestion"
        title="Modifier le produit"
        description={
          product
            ? `Mettez a jour ${product.name}, son prix, son stock et sa visibilite.`
            : "Mettez a jour les informations du produit selectionne."
        }
        breadcrumbs={[
          { label: "Gestion" },
          { label: "Produits" },
          { label: "Modifier" },
        ]}
        actions={
          <Link href="/gestionnaire/produits" className="button-secondary">
            Retour aux produits
          </Link>
        }
      />

      {!productsResponse || !categories ? (
        <DataLoadAlert
          description="Le produit ou les categories n'ont pas pu etre charges."
          retryHref={`/gestionnaire/produits/${numericProductId}/modifier`}
        />
      ) : !product ? (
        <EmptyState
          icon={<PackageIcon className="h-5 w-5" />}
          title="Produit introuvable"
          description="Cette reference n existe pas ou n est plus disponible."
          action={
            <Link href="/gestionnaire/produits" className="button-primary">
              Retour aux produits
            </Link>
          }
        />
      ) : (
        <ManagerProductForm mode="edit" product={product} categories={categories} />
      )}
    </>
  );
}
