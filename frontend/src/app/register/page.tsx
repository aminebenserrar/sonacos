import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/register-form";
import { PublicShell } from "@/components/layout/public-shell";
import { getOptionalSession } from "@/lib/auth/guards";
import { getRoleDashboardPath } from "@/lib/auth/session";

export default async function RegisterPage() {
  const session = await getOptionalSession();

  if (session) {
    redirect(getRoleDashboardPath(session.primaryRole));
  }

  return (
    <PublicShell>
      <section className="page-shell section-block">
        <div className="mx-auto max-w-5xl">
          <div className="card overflow-hidden">
            <div className="grid lg:grid-cols-[0.78fr_1.22fr]">
              <div className="relative bg-brand p-6 text-white md:p-8">
                <div className="absolute inset-x-0 top-0 h-36 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_55%)]" />
                <p className="eyebrow !text-accent-soft">inscription client</p>
                <h1 className="mt-3 font-heading text-3xl font-black tracking-[-0.05em]">
                  Creer un compte
                </h1>
                <p className="mt-3 text-sm leading-6 text-white/78">
                  Inscription simple pour commander et suivre les operations.
                </p>

                <div className="mt-6 grid gap-3">
                  {[
                    "Panier et commandes depuis votre espace client",
                    "Factures telechargeables apres validation",
                    "Coordonnees enregistrees pour retrait ou livraison",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-[14px] border border-white/10 bg-white/8 px-4 py-3 text-sm"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 md:p-8">
                <RegisterForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
