"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { ActiveFilterChips, FilterBar, FilterSelect } from "@/components/ui/filter-controls";
import { MobileDataCard } from "@/components/ui/mobile-data-card";
import { Pagination } from "@/components/ui/pagination";
import { ResponsiveRecords } from "@/components/ui/responsive-records";
import { SearchInput } from "@/components/ui/search-input";
import { UsersIcon } from "@/components/ui/store-icons";
import { StatusBadge } from "@/components/ui/status-badge";
import { useToast } from "@/components/ui/toast-provider";
import { UserAvatar } from "@/components/ui/user-avatar";
import { MetricGrid } from "@/components/workspace/metric-grid";
import { useClientPagination } from "@/hooks/use-client-pagination";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { formatDateShort, formatRoleLabel } from "@/lib/formatters";
import type { AdminUser } from "@/lib/api/admin";
import type { ApiErrorResponse } from "@/types/api";

type AdminUsersManagementProps = {
  initialUsers: AdminUser[];
  availableRoles: string[];
};

type CreateDraft = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  active: boolean;
  password: string;
  roles: string[];
};

const USER_FILTER_DEFAULTS = {
  search: "",
  role: "TOUS",
  status: "TOUS",
};

export function AdminUsersManagement({
  initialUsers,
  availableRoles,
}: AdminUsersManagementProps) {
  const router = useRouter();
  const { notify } = useToast();
  const [users, setUsers] = useState(initialUsers);
  const [pendingUserId, setPendingUserId] = useState<number | null>(null);
  const [createDraft, setCreateDraft] = useState<CreateDraft>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    active: true,
    password: "",
    roles: ["CLIENT"],
  });
  const [error, setError] = useState<string | null>(null);
  const { filters, setFilter, resetFilters, activeCount } = useUrlFilters(USER_FILTER_DEFAULTS);
  const { search: query, role: roleFilter, status: statusFilter } = filters;

  const sortedRoles = useMemo(() => [...availableRoles].sort(), [availableRoles]);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return users.filter((user) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        user.fullName.toLowerCase().includes(normalizedQuery) ||
        user.email.toLowerCase().includes(normalizedQuery) ||
        user.city.toLowerCase().includes(normalizedQuery) ||
        user.roles.some(
          (role) =>
            role.toLowerCase().includes(normalizedQuery) ||
            formatRoleLabel(role).toLowerCase().includes(normalizedQuery),
        );

      const matchesRole = roleFilter === "TOUS" || user.roles.includes(roleFilter);
      const matchesStatus =
        statusFilter === "TOUS" ||
        (statusFilter === "ACTIF" && user.active) ||
        (statusFilter === "INACTIF" && !user.active);

      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [users, query, roleFilter, statusFilter]);
  const userPagination = useClientPagination(filteredUsers, {
    totalItems: filteredUsers.length,
    resetKey: `${query}|${roleFilter}|${statusFilter}`,
  });

  const metrics = useMemo(
    () => [
      {
        label: "Comptes",
        value: String(users.length).padStart(2, "0"),
        detail: "utilisateurs en base",
        icon: "users" as const,
      },
      {
        label: "Actifs",
        value: String(users.filter((user) => user.active).length).padStart(2, "0"),
        detail: "acces ouverts",
        icon: "check" as const,
      },
      {
        label: "Admins",
        value: String(users.filter((user) => user.roles.includes("ADMIN")).length).padStart(
          2,
          "0",
        ),
        detail: "administration",
        icon: "chart" as const,
      },
      {
        label: "Clients",
        value: String(users.filter((user) => user.roles.includes("CLIENT")).length).padStart(
          2,
          "0",
        ),
        detail: "espace commercial",
        icon: "users" as const,
      },
    ],
    [users],
  );

  function startEdit(user: AdminUser) {
    router.push(`/admin/utilisateurs/${user.id}/modifier`);
  }

  async function createUser() {
    setPendingUserId(0);
    setError(null);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createDraft),
      });

      const payload = (await response.json()) as AdminUser | ApiErrorResponse;
      if (!response.ok) {
        const message = (payload as ApiErrorResponse).message;
        setError(message);
        notify({ title: "Creation impossible", description: message, type: "error" });
        return;
      }

      setUsers((current) => [payload as AdminUser, ...current]);
      setCreateDraft({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        active: true,
        password: "",
        roles: ["CLIENT"],
      });
      notify({
        title: "Compte interne cree",
        description: "Le nouvel utilisateur a ete ajoute avec succes.",
        type: "success",
      });
      router.refresh();
    } catch {
      setError("Impossible de creer ce compte.");
      notify({
        title: "Une erreur est survenue",
        description: "Veuillez reessayer.",
        type: "error",
      });
    } finally {
      setPendingUserId(null);
    }
  }

  async function toggleStatus(userId: number, nextActive: boolean) {
    const currentUser = users.find((user) => user.id === userId);
    if (!currentUser) {
      return;
    }

    const confirmed = window.confirm(
      nextActive
        ? `Activer le compte de ${currentUser.fullName} ?`
        : `Desactiver le compte de ${currentUser.fullName} ? Cet utilisateur ne pourra plus se connecter.`,
    );

    if (!confirmed) {
      return;
    }

    setPendingUserId(userId);
    setError(null);

    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ active: nextActive }),
      });

      const payload = (await response.json()) as AdminUser | ApiErrorResponse;
      if (!response.ok) {
        const message = (payload as ApiErrorResponse).message;
        setError(message);
        notify({ title: "Action impossible", description: message, type: "error" });
        return;
      }

      setUsers((current) =>
        current.map((user) => (user.id === userId ? (payload as AdminUser) : user)),
      );

      notify({
        title: nextActive ? "Compte active" : "Compte desactive",
        description: "Le statut du compte a ete enregistre.",
        type: "success",
      });
      router.refresh();
    } catch {
      setError("Impossible de modifier le statut de cet utilisateur.");
      notify({
        title: "Une erreur est survenue",
        description: "Veuillez reessayer.",
        type: "error",
      });
    } finally {
      setPendingUserId(null);
    }
  }

  function toggleRole(selected: string[], role: string) {
    return selected.includes(role)
      ? selected.filter((item) => item !== role)
      : [...selected, role];
  }

  return (
    <div className="grid gap-6">
      <MetricGrid items={metrics} />

      <div className="card p-6">
        <div className="panel-header">
          <h2 className="panel-title">Creer un compte interne</h2>
          <p className="panel-copy">
            Ajoutez un nouveau compte SONACOS, choisissez ses roles et son statut initial.
          </p>
        </div>

        <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold text-brand-strong">
              Prenom
              <input
                className="form-control"
                value={createDraft.firstName}
                onChange={(event) =>
                  setCreateDraft((current) => ({
                    ...current,
                    firstName: event.target.value,
                  }))
                }
              />
            </label>
            <label className="text-sm font-semibold text-brand-strong">
              Nom
              <input
                className="form-control"
                value={createDraft.lastName}
                onChange={(event) =>
                  setCreateDraft((current) => ({
                    ...current,
                    lastName: event.target.value,
                  }))
                }
              />
            </label>
            <label className="text-sm font-semibold text-brand-strong">
              E-mail
              <input
                className="form-control"
                value={createDraft.email}
                onChange={(event) =>
                  setCreateDraft((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
              />
            </label>
            <label className="text-sm font-semibold text-brand-strong">
              Telephone
              <input
                className="form-control"
                value={createDraft.phone}
                onChange={(event) =>
                  setCreateDraft((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
              />
            </label>
            <label className="text-sm font-semibold text-brand-strong md:col-span-2">
              Adresse
              <input
                className="form-control"
                value={createDraft.address}
                onChange={(event) =>
                  setCreateDraft((current) => ({
                    ...current,
                    address: event.target.value,
                  }))
                }
              />
            </label>
            <label className="text-sm font-semibold text-brand-strong">
              Ville
              <input
                className="form-control"
                value={createDraft.city}
                onChange={(event) =>
                  setCreateDraft((current) => ({
                    ...current,
                    city: event.target.value,
                  }))
                }
              />
            </label>
            <label className="text-sm font-semibold text-brand-strong">
              Mot de passe initial
              <input
                className="form-control"
                type="password"
                value={createDraft.password}
                onChange={(event) =>
                  setCreateDraft((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
              />
            </label>
          </div>

          <div className="rounded-[18px] border border-line bg-surface-strong/70 p-4">
            <p className="text-sm font-semibold text-brand-strong">Roles et statut</p>
            <label className="mt-4 flex items-center gap-3 text-sm font-semibold text-brand-strong">
              <input
                type="checkbox"
                checked={createDraft.active}
                onChange={(event) =>
                  setCreateDraft((current) => ({
                    ...current,
                    active: event.target.checked,
                  }))
                }
              />
              Compte actif des la creation
            </label>

            <div className="mt-4 flex flex-wrap gap-2">
              {sortedRoles.map((role) => {
                const active = createDraft.roles.includes(role);
                return (
                  <button
                    key={role}
                    type="button"
                    className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] ${
                      active
                        ? "border-brand bg-brand text-white"
                        : "border-line bg-white text-brand-strong"
                    }`}
                    onClick={() =>
                      setCreateDraft((current) => {
                        const nextRoles = toggleRole(current.roles, role);
                        return {
                          ...current,
                          roles: nextRoles.length > 0 ? nextRoles : current.roles,
                        };
                      })
                    }
                  >
                    {formatRoleLabel(role)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            className="button-primary"
            disabled={pendingUserId === 0}
            onClick={createUser}
          >
            {pendingUserId === 0 ? "Creation..." : "Creer le compte"}
          </button>
        </div>
      </div>

      <div className="card p-6">
        <div className="panel-header">
          <h2 className="panel-title">Liste des comptes</h2>
          <p className="panel-copy">
            Recherchez, filtrez et gerez les utilisateurs, leurs roles et leur activation.
          </p>
        </div>

        <div className="mt-5 grid gap-3">
          <FilterBar
            resultLabel={`${filteredUsers.length} utilisateur${filteredUsers.length > 1 ? "s" : ""} trouve${filteredUsers.length > 1 ? "s" : ""}`}
            activeCount={activeCount}
            onReset={resetFilters}
          >
            <SearchInput
              value={query}
              onChange={(value) => setFilter("search", value)}
              placeholder="Rechercher par nom, e-mail ou role"
              label="Rechercher un utilisateur"
            />
            <FilterSelect
              label="Filtrer par role"
              value={roleFilter}
              onChange={(value) => setFilter("role", value)}
              options={[
                { value: "TOUS", label: "Tous les roles" },
                ...sortedRoles.map((role) => ({ value: role, label: formatRoleLabel(role) })),
              ]}
            />
            <FilterSelect
              label="Filtrer par statut"
              value={statusFilter}
              onChange={(value) => setFilter("status", value)}
              options={[
                { value: "TOUS", label: "Tous les statuts" },
                { value: "ACTIF", label: "Actifs" },
                { value: "INACTIF", label: "Inactifs" },
              ]}
            />
          </FilterBar>
          <ActiveFilterChips
            chips={[
              ...(query ? [{ key: "search", label: "Recherche", value: query, onRemove: () => setFilter("search", "") }] : []),
              ...(roleFilter !== "TOUS" ? [{ key: "role", label: "Role", value: formatRoleLabel(roleFilter), onRemove: () => setFilter("role", "TOUS") }] : []),
              ...(statusFilter !== "TOUS" ? [{ key: "status", label: "Statut", value: statusFilter === "ACTIF" ? "Actif" : "Inactif", onRemove: () => setFilter("status", "TOUS") }] : []),
            ]}
            onClear={resetFilters}
          />
        </div>

        {error ? (
          <div className="mt-4 rounded-[12px] border border-danger/20 bg-danger/8 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        ) : null}

        <div className="mt-5">
          <ResponsiveRecords
            items={userPagination.paginatedItems}
            empty={
              <div className="rounded-[18px] border border-line bg-surface p-6">
                <EmptyState
                  icon={<UsersIcon className="h-5 w-5" />}
                  title="Aucun utilisateur trouve"
                  description="Essayez de modifier votre recherche ou vos filtres."
                />
              </div>
            }
            desktop={
              <div className="table-shell">
                <div className="table-scroll">
                  <table className="table-base">
                    <thead>
                      <tr>
                        <th>Utilisateur</th>
                        <th>Ville</th>
                        <th>Roles</th>
                        <th>Cree le</th>
                        <th>Statut</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userPagination.paginatedItems.map((user) => {
                        const busy = pendingUserId === user.id;

                        return (
                          <tr key={user.id}>
                            <td>
                              <div className="flex items-center gap-3">
                                <UserAvatar name={user.fullName} size="sm" />
                                <div className="min-w-0">
                                  <p className="truncate font-semibold">{user.fullName}</p>
                                  <p className="truncate text-sm text-muted">{user.email}</p>
                                </div>
                              </div>
                            </td>
                            <td>{user.city}</td>
                            <td>
                              <div className="flex flex-wrap gap-2">
                                {user.roles.map((role) => (
                                  <StatusBadge key={role} value={role} kind="role" />
                                ))}
                              </div>
                            </td>
                            <td>{formatDateShort(user.createdAt)}</td>
                            <td>
                              <StatusBadge value={user.active ? "ACTIF" : "INACTIF"} />
                            </td>
                            <td>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  className="button-secondary px-4"
                                  disabled={busy}
                                  onClick={() => startEdit(user)}
                                >
                                  Modifier
                                </button>
                                <button
                                  type="button"
                                  className="button-tertiary px-3"
                                  disabled={busy}
                                  onClick={() => toggleStatus(user.id, !user.active)}
                                >
                                  {user.active ? "Desactiver" : "Activer"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            }
            renderMobileCard={(user) => {
              const busy = pendingUserId === user.id;

              return (
                <MobileDataCard
                  key={user.id}
                  title={user.fullName}
                  subtitle={user.email}
                  badges={
                    <>
                      <StatusBadge value={user.active ? "ACTIF" : "INACTIF"} />
                      {user.roles.slice(0, 2).map((role) => (
                        <StatusBadge key={role} value={role} kind="role" />
                      ))}
                    </>
                  }
                  description={
                    user.roles.length > 2 ? (
                      <p>{user.roles.slice(2).map((role) => formatRoleLabel(role)).join(", ")}</p>
                    ) : undefined
                  }
                  fields={[
                    { label: "Ville", value: user.city || "Non renseignee" },
                    { label: "Creation", value: formatDateShort(user.createdAt) },
                    {
                      label: "Roles",
                      value: user.roles.map((role) => formatRoleLabel(role)).join(", "),
                    },
                  ]}
                  actions={
                    <>
                      <button
                        type="button"
                        className="button-secondary px-4"
                        disabled={busy}
                        onClick={() => startEdit(user)}
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        className="button-tertiary px-3"
                        disabled={busy}
                        onClick={() => toggleStatus(user.id, !user.active)}
                      >
                        {user.active ? "Desactiver" : "Activer"}
                      </button>
                    </>
                  }
                />
              );
            }}
          />
          <Pagination
            currentPage={userPagination.currentPage}
            totalPages={userPagination.totalPages}
            pageSize={userPagination.pageSize}
            totalItems={userPagination.totalItems}
            hrefForPage={userPagination.hrefForPage}
            hrefForPageSize={userPagination.hrefForPageSize}
            label="Pagination des utilisateurs"
          />
        </div>
      </div>

    </div>
  );
}
