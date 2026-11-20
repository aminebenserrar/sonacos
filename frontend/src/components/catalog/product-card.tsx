"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/product";
import { getProductImage } from "@/lib/catalog-ui";
import { formatCurrency } from "@/lib/formatters";
import {
  PackageIcon,
  TagIcon,
  TruckIcon,
} from "@/components/ui/store-icons";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const stockTone =
    product.stockQuantity <= product.alertThreshold
      ? "border-danger/20 bg-danger/8 text-danger"
      : "border-brand/15 bg-brand/8 text-brand";
  const stockLabel =
    product.stockQuantity <= 0
      ? "Rupture"
      : product.stockQuantity <= product.alertThreshold
        ? "Stock faible"
        : "Disponible";

  return (
    <Link
      href={`/produits/${product.slug}`}
      aria-label={`Ouvrir la page detail du produit ${product.name}`}
      className="card group flex h-full cursor-pointer flex-col overflow-hidden transition hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-[0_10px_26px_rgba(24,57,38,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
      onKeyDown={(event) => {
        if (event.key === " ") {
          event.preventDefault();
          event.currentTarget.click();
        }
      }}
    >
      <article className="flex h-full flex-col">
        <div className="relative aspect-[4/3]">
          <Image
            src={getProductImage(product)}
            alt={product.name}
            fill
            className="object-cover transition duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-strong/75 via-brand-strong/20 to-transparent" />
          <div className="absolute left-4 top-4">
            <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-brand-strong">
              {product.categoryName}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-start justify-between gap-4">
            <span className={`status-chip ${stockTone}`}>{stockLabel}</span>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              {product.reference}
            </span>
          </div>

          <div className="mt-4">
            <h3 className="min-h-[3.5rem] font-heading text-xl font-bold tracking-[-0.03em] text-brand-strong transition group-hover:text-brand">
              {product.name}
            </h3>
            <p className="mt-2 min-h-[3rem] text-sm leading-6 text-muted">
              {product.shortDescription}
            </p>
          </div>

          <div className="mt-5 grid gap-2 rounded-[12px] border border-line bg-surface-muted p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted">
                <TagIcon className="h-4 w-4" />
                Prix
              </div>
              <p className="font-heading text-xl font-bold text-brand">
                {formatCurrency(product.price, "DH")}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted">
              <PackageIcon className="h-4 w-4 text-brand" />
              {product.unit} - Stock {product.stockQuantity}
            </div>
          </div>

          <div className="mt-auto pt-5">
            <div className="flex items-center gap-2 rounded-[10px] border border-line bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted transition group-hover:border-brand/25 group-hover:text-brand-strong">
              <TruckIcon className="h-4 w-4 text-brand" />
              Livraison ou retrait en centre
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
