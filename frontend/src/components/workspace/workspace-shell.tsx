"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { LogoutButton } from "@/components/auth/logout-button";
import { SonacosLogo } from "@/components/brand/sonacos-logo";
import {
  CartIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ClipboardIcon,
  CreditCardIcon,
  GlobeIcon,
  GridIcon,
  MenuIcon,
  PackageIcon,
  ReceiptIcon,
  SettingsIcon,
  ShieldIcon,
  UserIcon,
  UsersIcon,
  XIcon,
} from "@/components/ui/store-icons";
import { UserAvatar } from "@/components/ui/user-avatar";
import { formatRoleLabel } from "@/lib/formatters";
import type { WorkspaceNavItem, WorkspaceNavSection } from "@/lib/workspace/navigation";
import type { SessionUser } from "@/types/auth";

type NavIcon = WorkspaceNavItem["icon"];

type WorkspaceShellProps = {
  role: string;
  navSections: WorkspaceNavSection[];
  session: SessionUser;
  children: ReactNode;
};

const iconMap: Record<NavIcon, typeof GridIcon> = {
  grid: GridIcon,
  cart: CartIcon,
  receipt: ReceiptIcon,
  clipboard: ClipboardIcon,
  package: PackageIcon,
  "credit-card": CreditCardIcon,
  check: CheckCircleIcon,
  users: UsersIcon,
  shield: ShieldIcon,
  settings: SettingsIcon,
  archive: ShieldIcon,
};

export function WorkspaceShell({
  role,
  navSections,
  session,
  children,
}: WorkspaceShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  let activeContext = { section: "Espace sécurisé", item: "Tableau de bord" };

  for (const section of navSections) {
    for (const item of section.items) {
      if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
        activeContext = { section: section.label, item: item.label };
      }
    }
  }

  if (pathname.startsWith("/gestionnaire/produits/nouveau")) {
    activeContext = { section: "Gestion", item: "Ajouter un produit" };
  } else if (pathname.startsWith("/gestionnaire/produits/")) {
    activeContext = { section: "Gestion", item: "Modifier un produit" };
  } else if (pathname.startsWith("/admin/utilisateurs/")) {
    activeContext = { section: "Administration", item: "Modifier utilisateur" };
  } else if (pathname.startsWith("/admin/activite/")) {
    activeContext = { section: "Administration", item: "Detail de l operation" };
  } else if (pathname.startsWith("/auditeur/journal/")) {
    activeContext = { section: "Audit", item: "Detail de l operation" };
  } else if (pathname.startsWith("/responsable/validations/")) {
    activeContext = { section: "Validations", item: "Detail de la demande" };
  }

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-5">
        <SonacosLogo compact />
        <button
          type="button"
          className="icon-button xl:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Fermer le menu"
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="mb-6 rounded-[12px] border border-line bg-surface-muted px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
            Espace
          </p>
          <p className="mt-2 text-sm font-semibold text-brand-strong">{role}</p>
        </div>

        <div className="space-y-6">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="sidebar-section-label">{section.label}</p>
              <div className="mt-2 space-y-1">
                {section.items.map((item) => {
                  const Icon = iconMap[item.icon];
                  const isActive =
                    pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`sidebar-link ${isActive ? "sidebar-link-active" : ""}`}
                      onClick={() => setMobileOpen(false)}
                    >
                      <span className="sidebar-link-marker" />
                      <Icon className={`h-4 w-4 ${isActive ? "text-brand" : "text-muted"}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-line px-4 py-4">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-[12px] border border-line bg-white px-3 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <UserAvatar name={session.fullName} size="sm" />
              <div className="min-w-0 text-left">
                <p className="truncate text-sm font-semibold text-brand-strong">
                  {session.fullName}
                </p>
                <p className="truncate text-xs text-muted">
                  {formatRoleLabel(session.primaryRole)}
                </p>
              </div>
            </div>
            <ChevronDownIcon className="h-4 w-4 text-muted transition group-open:rotate-180" />
          </summary>
          <div className="mt-2 space-y-2 rounded-[12px] border border-line bg-surface p-2">
            <Link
              href="/profil"
              className="button-tertiary w-full justify-start"
              onClick={() => setMobileOpen(false)}
            >
              <UserIcon className="h-4 w-4" />
              Mon profil
            </Link>
            <Link
              href="/"
              className="button-tertiary w-full justify-start"
              onClick={() => setMobileOpen(false)}
            >
              <GlobeIcon className="h-4 w-4" />
              Site public
            </Link>
            <LogoutButton className="button-secondary w-full justify-start" />
          </div>
        </details>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside className="hidden w-[252px] shrink-0 border-r border-line bg-white xl:flex xl:flex-col">
          {sidebarContent}
        </aside>

        {mobileOpen ? (
          <div className="fixed inset-0 z-[80] xl:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-brand-strong/20"
              aria-label="Fermer le menu"
              onClick={() => setMobileOpen(false)}
            />
            <div className="absolute inset-y-0 left-0 w-[88vw] max-w-[320px] border-r border-line bg-white shadow-[0_20px_40px_rgba(20,37,24,0.08)]">
              {sidebarContent}
            </div>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-line bg-background/95 backdrop-blur">
            <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  className="icon-button xl:hidden"
                  onClick={() => setMobileOpen(true)}
                  aria-label="Ouvrir le menu"
                >
                  <MenuIcon className="h-4 w-4" />
                </button>

                <div className="min-w-0">
                  <p className="truncate text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                    {activeContext.section}
                  </p>
                  <p className="truncate text-sm font-semibold text-brand-strong">
                    {activeContext.item}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/"
                  className="hidden rounded-[10px] border border-line bg-white px-3 py-2 text-sm font-medium text-brand-strong hover:border-brand/20 hover:bg-surface md:inline-flex"
                >
                  Site public
                </Link>
                <Link
                  href="/profil"
                  className="inline-flex items-center gap-3 rounded-[12px] border border-line bg-white px-3 py-2 hover:border-brand/20"
                >
                  <UserAvatar name={session.fullName} size="sm" />
                  <div className="hidden text-left md:block">
                    <p className="text-sm font-semibold text-brand-strong">
                      {session.firstName} {session.lastName}
                    </p>
                    <p className="text-xs text-muted">
                      {formatRoleLabel(session.primaryRole)}
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-5 md:px-6 md:py-6">
            <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
