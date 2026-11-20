import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { PublicShell } from "@/components/layout/public-shell";
import { getOptionalSession } from "@/lib/auth/guards";
import { getRoleDashboardPath } from "@/lib/auth/session";

export default async function LoginPage() {
  const session = await getOptionalSession();

  if (session) {
    redirect(getRoleDashboardPath(session.primaryRole));
  }

  return (
    <PublicShell>
      <section className="page-shell section-block">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="card relative overflow-hidden bg-brand-strong p-6 text-white md:p-8">
            <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_right,rgba(244,191,117,0.2),transparent_55%)]" />
            <div className="absolute -right-20 bottom-0 h-48 w-48 rounded-full bg-white/6 blur-3xl" />

            <div className="relative">
              <p className="eyebrow !text-accent-soft">espace sonacos</p>
              <h1 className="mt-3 max-w-md font-heading text-3xl font-bold tracking-[-0.05em] md:text-4xl">
                Accedez aux espaces metier de la plateforme.
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-7 text-white/80">
                Connectez-vous pour suivre les commandes, gerer les produits, traiter
                les validations et administrer les comptes selon votre role.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  {
                    label: "Catalogue",
                    value: "Acces public",
                    detail: "consultation sans connexion",
                  },
                  {
                    label: "Commandes",
                    value: "Suivi client",
                    detail: "historique, panier et factures",
                  },
                  {
                    label: "Stock",
                    value: "Gestion interne",
                    detail: "mouvements, paiements et produits",
                  },
                  {
                    label: "Validation",
                    value: "Decision",
                    detail: "responsable, admin, audit et archives",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[18px] border border-white/10 bg-white/8 px-4 py-4"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                      {item.label}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">{item.value}</p>
                    <p className="mt-1 text-sm text-white/72">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card p-6 md:p-8">
            <LoginForm />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
