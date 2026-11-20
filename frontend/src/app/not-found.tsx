import Link from "next/link";
import { PublicShell } from "@/components/layout/public-shell";

export default function NotFound() {
  return (
    <PublicShell>
      <section className="page-shell flex min-h-[60vh] items-center py-16">
        <div className="card mx-auto max-w-2xl p-10 text-center">
          <p className="eyebrow">page introuvable</p>
          <h1 className="section-title mt-4">Cette page est introuvable.</h1>
          <p className="mt-4 text-sm leading-7 text-muted">
            Retournez a l accueil ou au catalogue pour poursuivre votre
            navigation.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/" className="button-secondary">
              Retour accueil
            </Link>
            <Link href="/catalogue" className="button-primary">
              Ouvrir le catalogue
            </Link>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
