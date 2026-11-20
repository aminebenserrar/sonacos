import Link from "next/link";
import { DataLoadAlert } from "@/components/ui/data-load-alert";
import { CustomerCartView } from "@/components/customer/customer-cart-view";
import { WorkspacePageHeader } from "@/components/workspace/workspace-page-header";
import { getMyCart } from "@/lib/api/customer";
import { getSessionToken } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function CustomerCartPage() {
  const token = await getSessionToken();
  let cart: Awaited<ReturnType<typeof getMyCart>> | null = null;

  if (token) {
    try {
      cart = await getMyCart(token);
    } catch {
      cart = null;
    }
  }

  return (
    <>
      <WorkspacePageHeader
        title="Mon panier"
        description="Verifiez les articles selectionnes avant la confirmation de la commande."
        actions={
          <Link href="/catalogue" className="button-secondary">
            Ajouter des produits
          </Link>
        }
      />

      {cart ? (
        <CustomerCartView initialCart={cart} />
      ) : (
        <DataLoadAlert
          description="Le panier client n'a pas pu etre charge."
          retryHref="/espace-client/panier"
        />
      )}
    </>
  );
}
