import Image from "next/image";

export async function HomeHero() {
  return (
    <section className="page-shell section-block">
      <div className="grid gap-6 lg:grid-cols-[0.94fr_1.06fr] lg:items-center">
        <div className="px-1 py-2 md:py-4">
          <p className="eyebrow">solutions agricoles</p>
          <h1 className="mt-3 max-w-[12ch] font-heading text-[2.7rem] font-bold leading-[0.94] tracking-[-0.05em] text-brand-strong md:text-[4.1rem]">
            Des solutions agricoles au service de vos cultures.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-muted md:text-base">
            Decouvrez les semences certifiees et les engrais proposes par SONACOS,
            consultez le catalogue public et accedez a votre espace de gestion en
            quelques clics.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="subtle-panel px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Catalogue</p>
              <p className="mt-2 text-sm font-semibold text-brand-strong">
                Semences et engrais classes par famille
              </p>
            </div>
            <div className="subtle-panel px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Commande</p>
              <p className="mt-2 text-sm font-semibold text-brand-strong">
                Panier, paiement et suivi centralises
              </p>
            </div>
            <div className="subtle-panel px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Gestion</p>
              <p className="mt-2 text-sm font-semibold text-brand-strong">
                Stock, validations et tableaux de bord
              </p>
            </div>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="relative min-h-[320px] md:min-h-[380px]">
            <Image
              src="/internet-products/wheat-field.jpg"
              alt="Culture agricole"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 45vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-strong/88 via-brand-strong/26 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white md:p-6">
              <div className="inline-flex items-center rounded-full border border-white/18 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                Centres de retrait et livraison
              </div>
              <p className="mt-3 max-w-sm text-sm leading-6 text-white/84">
                Une vitrine claire pour les clients et un espace metier structure
                pour l&apos;equipe interne.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
