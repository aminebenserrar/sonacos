import { ProductCard } from "@/components/catalog/product-card";
import { SectionHeading } from "@/components/store/section-heading";
import { DataLoadAlert } from "@/components/ui/data-load-alert";
import { EmptyState } from "@/components/ui/empty-state";
import { PackageIcon } from "@/components/ui/store-icons";
import { getFeaturedProducts } from "@/lib/api/catalog";

export async function FeaturedProducts() {
  let featuredProducts: Awaited<ReturnType<typeof getFeaturedProducts>> | null = null;

  try {
    featuredProducts = await getFeaturedProducts();
  } catch {
    featuredProducts = null;
  }

  return (
    <section className="page-shell section-block">
      <SectionHeading
        eyebrow="selection"
        title="Produits populaires"
        description="Une lecture simple, avec les references mises en avant directement sur la page d accueil."
      />

      {featuredProducts ? (
        featuredProducts.length > 0 ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-8">
            <EmptyState
              icon={<PackageIcon className="h-5 w-5" />}
              title="Aucun produit mis en avant"
              description="Les references vedettes apparaitront ici des qu'elles seront publiees."
            />
          </div>
        )
      ) : (
        <div className="mt-8">
          <DataLoadAlert
            description="Les produits mis en avant n'ont pas pu etre charges depuis l'API publique."
            retryHref="/"
          />
        </div>
      )}
    </section>
  );
}
