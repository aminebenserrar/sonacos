import { DataLoadAlert } from "@/components/ui/data-load-alert";
import { ManagerProductsManagement } from "@/components/manager/manager-products-management";
import { WorkspacePageHeader } from "@/components/workspace/workspace-page-header";
import { getManagedProducts, getPublicCategories } from "@/lib/api/catalog";
import { getSessionToken } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function ManagerProductsPage() {
  const token = await getSessionToken();
  let productsResponse: Awaited<ReturnType<typeof getManagedProducts>> | null = null;
  let categories: Awaited<ReturnType<typeof getPublicCategories>> | null = null;

  if (token) {
    const [productsResult, categoriesResult] = await Promise.allSettled([
      getManagedProducts(token),
      getPublicCategories(),
    ]);

    if (productsResult.status === "fulfilled") {
      productsResponse = productsResult.value;
    }

    if (categoriesResult.status === "fulfilled") {
      categories = categoriesResult.value;
    }
  }

  return (
    <>
      <WorkspacePageHeader
        eyebrow="Gestion"
        title="Produits"
        description="Gerez le catalogue, les stocks, les prix et la disponibilite des produits."
        breadcrumbs={[
          { label: "Gestion" },
          { label: "Produits" },
        ]}
      />

      {productsResponse && categories ? (
        <ManagerProductsManagement
          initialProducts={productsResponse.content}
          categories={categories}
        />
      ) : (
        <DataLoadAlert
          description="La liste des produits ou les categories n'ont pas pu etre chargees."
          retryHref="/gestionnaire/produits"
        />
      )}
    </>
  );
}
