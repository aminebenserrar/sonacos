export function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-line/70 bg-brand-strong py-10 text-white">
      <div className="page-shell grid gap-6 text-sm md:grid-cols-[1.1fr_0.9fr_0.9fr]">
        <div>
          <p className="font-heading text-xl font-bold">SONACOS</p>
          <p className="mt-2 max-w-md leading-6 text-white/76">
            SONACOS propose des semences et des engrais destines aux besoins
            des exploitations agricoles et des campagnes de production.
          </p>
        </div>

        <div className="grid gap-1.5">
          <p className="font-heading text-sm font-bold uppercase tracking-[0.14em] text-accent-soft">
            Parcours
          </p>
          <p className="text-white/76">Visiteur: catalogue sans authentification</p>
          <p className="text-white/76">Client: panier, commande et facture</p>
          <p className="text-white/76">Interne: gestion, validation et administration</p>
        </div>

        <div className="grid gap-1.5">
          <p className="font-heading text-sm font-bold uppercase tracking-[0.14em] text-accent-soft">
            Contact
          </p>
          <p className="text-white/76">Casablanca, Maroc</p>
          <p className="text-white/76">+212 5 22 00 00 00</p>
          <p className="text-white/76">contact@sonacos.ma</p>
        </div>
      </div>
    </footer>
  );
}
