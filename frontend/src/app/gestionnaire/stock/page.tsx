import { DataLoadAlert } from "@/components/ui/data-load-alert";
import { ManagerStockManagement } from "@/components/manager/manager-stock-management";
import { WorkspacePageHeader } from "@/components/workspace/workspace-page-header";
import { getManagedProducts } from "@/lib/api/catalog";
import { getManagerStockMovements } from "@/lib/api/manager";
import { getSessionToken } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function ManagerStockPage() {
  const token = await getSessionToken();
  let stockMovements: Awaited<ReturnType<typeof getManagerStockMovements>> | null =
    null;
  let productsResponse: Awaited<ReturnType<typeof getManagedProducts>> | null = null;

  if (token) {
    const [stockResult, productsResult] = await Promise.allSettled([
      getManagerStockMovements(token),
      getManagedProducts(token, 0, 100),
    ]);

    if (stockResult.status === "fulfilled") {
      stockMovements = stockResult.value;
    }

    if (productsResult.status === "fulfilled") {
      productsResponse = productsResult.value;
    }
  }

  return (
    <>
      <WorkspacePageHeader
        eyebrow="Gestion"
        title="Gestion du stock"
        description="Suivez les entrees, les sorties, les reservations et les seuils d alerte."
        breadcrumbs={[
          { label: "Gestion" },
          { label: "Stock" },
        ]}
      />

      {stockMovements && productsResponse ? (
        <ManagerStockManagement
          initialMovements={stockMovements}
          products={productsResponse.content}
        />
      ) : (
        <DataLoadAlert
          description="Le stock ou la liste produit n'ont pas pu etre charges."
          retryHref="/gestionnaire/stock"
        />
      )}
    </>
  );
}
