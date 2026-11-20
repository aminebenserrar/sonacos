import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/customer/add-to-cart-button";
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/layout/public-shell";
import { getPublicProductBySlug } from "@/lib/api/catalog";
import { isApiClientError } from "@/lib/api/http";
import { getOptionalSession } from "@/lib/auth/guards";
import { getProductHighlights, getProductImage } from "@/lib/catalog-ui";

type ProductDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const session = await getOptionalSession();
  let product;

  try {
    product = await getPublicProductBySlug(slug);
  } catch (error) {
    if (isApiClientError(error) && error.status === 404) {
      notFound();
    }

    throw error;
  }

  const productHighlights = getProductHighlights(product);

  return (
    <PublicShell>
      <section className="page-shell section-block">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
          <Link href="/" className="hover:text-brand">
            Accueil
          </Link>
          <span>/</span>
          <Link href="/catalogue" className="hover:text-brand">
            Catalogue
          </Link>
          <span>/</span>
          <span className="text-brand-strong">{product.name}</span>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="card min-h-[460px] overflow-hidden">
            <div className="relative h-full min-h-[460px]">
              <Image
                src={getProductImage(product)}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-strong via-brand-strong/42 to-brand-strong/12" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <p className="text-xs uppercase tracking-[0.24em] text-accent-soft">
                  {product.categoryName}
                </p>
                <h1 className="mt-3 font-heading text-3xl font-bold tracking-[-0.05em] md:text-4xl">
                  {product.name}
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/85">
                  {product.fullDescription}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em]">
                    Prix en MAD
                  </span>
                  <span className="rounded-full border border-white/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em]">
                    Livraison ou retrait
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="card p-6">
              <p className="eyebrow">fiche produit</p>
              <div className="mt-3 rounded-[14px] border border-line bg-surface-muted p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-muted">
                  Prix de vente
                </p>
                <p className="mt-2 font-heading text-3xl font-bold text-brand">
                  {product.price.toLocaleString("fr-FR")} MAD
                </p>
                <p className="mt-2 text-sm text-muted">{product.unit}</p>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <div className="rounded-[12px] border border-line bg-white px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted">
                    Reference
                  </p>
                  <p className="mt-2 font-heading text-xl font-bold text-brand-strong">
                    {product.reference}
                  </p>
                </div>
                <div className="rounded-[12px] border border-line bg-white px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted">
                    Stock
                  </p>
                  <p className="mt-2 font-heading text-xl font-bold text-brand-strong">
                    {product.stockQuantity} unites
                  </p>
                </div>
                <div className="rounded-[12px] border border-line bg-white px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted">
                    Conditionnement
                  </p>
                  <p className="mt-2 font-heading text-xl font-bold text-brand-strong">
                    {product.unit}
                  </p>
                </div>
                <div className="rounded-[12px] border border-line bg-white px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted">
                    Disponibilite
                  </p>
                  <p className="mt-2 text-sm font-semibold text-brand-strong">
                    {product.stockQuantity > 0
                      ? "Produit disponible"
                      : "Verification gestionnaire requise"}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {session?.primaryRole === "CLIENT" ? (
                  <AddToCartButton
                    productId={product.id}
                    disabled={product.stockQuantity <= 0}
                  />
                ) : (
                  <Link href="/login" className="button-primary w-full">
                    Se connecter pour commander
                  </Link>
                )}
                {session?.primaryRole === "CLIENT" ? (
                  <Link href="/espace-client/panier" className="button-secondary w-full">
                    Voir mon panier
                  </Link>
                ) : null}
                <Link href="/catalogue" className="button-secondary w-full">
                  Retour au catalogue
                </Link>
              </div>
            </div>

            <div className="card p-6">
              <p className="font-heading text-2xl font-bold text-brand-strong">
                Points forts du produit
              </p>
              <ul className="mt-4 divide-y divide-line text-sm leading-6 text-muted">
                {productHighlights.map((highlight) => (
                  <li key={highlight} className="py-3">
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>

            <div className="card p-6">
              <p className="font-heading text-2xl font-bold text-brand-strong">
                Informations utiles
              </p>
              <div className="mt-4 divide-y divide-line rounded-[16px] border border-line bg-white text-sm leading-6 text-muted">
                <div className="px-4 py-3">{product.shortDescription}</div>
                <div className="px-4 py-3">
                  Le prix, le stock et le conditionnement restent visibles en un
                  coup d oeil.
                </div>
                <div className="px-4 py-3">
                  La commande se poursuit ensuite depuis l espace client.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
