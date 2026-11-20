import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { SonacosLogo } from "@/components/brand/sonacos-logo";
import { MenuIcon, XIcon } from "@/components/ui/store-icons";
import { getOptionalSession } from "@/lib/auth/guards";
import { getRoleDashboardPath, getSessionWorkspacePath } from "@/lib/auth/session";

const publicNavItems = [
  { href: "/", label: "Accueil" },
  { href: "/catalogue", label: "Catalogue" },
];

export async function SiteHeader() {
  const session = await getOptionalSession();
  const workspaceHref = session
    ? (getSessionWorkspacePath(session) ?? "/mon-espace")
    : "/login";
  const navItems = [...publicNavItems, { href: workspaceHref, label: "Mon espace" }];
  const actionItems = session ? (
    <>
      <Link
        href={getRoleDashboardPath(session.primaryRole)}
        className="button-secondary w-full sm:w-auto"
      >
        {session.firstName}
      </Link>
      <LogoutButton className="button-primary w-full sm:w-auto" />
    </>
  ) : (
    <>
      <Link href="/register" className="button-secondary w-full sm:w-auto">
        Inscription
      </Link>
      <Link href="/login" className="button-primary w-full sm:w-auto">
        Connexion
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-background/94 backdrop-blur-xl">
      <div className="border-b border-line/70 bg-brand-strong text-white">
        <div className="page-shell flex flex-wrap items-center gap-x-4 gap-y-1 py-2 text-[11px] font-medium">
          <div className="flex flex-wrap gap-3 text-white/78">
            <span>Casablanca, Maroc</span>
            <span>+212 5 22 00 00 00</span>
            <span className="hidden sm:inline">contact@sonacos.ma</span>
          </div>
        </div>
      </div>

      <div className="page-shell py-3">
        <div className="hidden gap-3 lg:grid lg:grid-cols-[auto_1fr_auto] lg:items-center">
          <SonacosLogo />

          <nav className="flex flex-wrap items-center gap-1 lg:justify-center">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-[12px] px-4 py-2 text-sm font-semibold text-muted transition hover:bg-surface hover:text-brand"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">{actionItems}</div>
        </div>

        <div className="flex items-center justify-between gap-3 lg:hidden">
          <SonacosLogo />

          <details className="group relative">
            <summary className="icon-button list-none cursor-pointer">
              <MenuIcon className="h-4 w-4 group-open:hidden" />
              <XIcon className="hidden h-4 w-4 group-open:block" />
            </summary>

            <div className="absolute right-0 top-[calc(100%+0.75rem)] w-[min(92vw,360px)] rounded-[20px] border border-line bg-white p-4 shadow-[0_22px_40px_rgba(20,37,24,0.08)]">
              <nav className="grid gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-[12px] px-4 py-3 text-sm font-semibold text-brand-strong hover:bg-surface-strong"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-4 grid gap-2 border-t border-line pt-4">
                {actionItems}
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
