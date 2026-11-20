type CatalogHeroProps = {
  productCount: number;
  categoryCount: number;
};

export function CatalogHero({ productCount, categoryCount }: CatalogHeroProps) {
  return (
    <section className="page-shell section-block pb-4">
      <div className="overflow-hidden rounded-[18px] border border-line bg-brand-strong px-6 py-6 text-white shadow-[0_6px_20px_rgba(24,57,38,0.08)] md:px-7 md:py-7">
        <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
          <div>
            <p className="eyebrow !text-accent-soft">catalogue agricole</p>
            <h1 className="mt-3 font-heading text-3xl font-bold tracking-[-0.05em] md:text-5xl">
              Explorez les produits par famille, stock et usage.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/82 md:text-base">
              Un catalogue public clair, pensé comme une vraie boutique :
              catégories visibles, filtres simples et accès direct à chaque fiche
              produit.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[14px] border border-white/12 bg-white/8 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/70">
                Produits
              </p>
              <p className="mt-2 font-heading text-3xl font-bold">
                {productCount}
              </p>
            </div>
            <div className="rounded-[14px] border border-white/12 bg-white/8 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/70">
                Catégories
              </p>
              <p className="mt-2 font-heading text-3xl font-bold">
                {categoryCount}
              </p>
            </div>
            <div className="rounded-[14px] border border-white/12 bg-white/8 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/70">
                Vente
              </p>
              <p className="mt-2 font-heading text-3xl font-bold">MAD</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
