"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import { useToast } from "@/components/ui/toast-provider";
import { UserAvatar } from "@/components/ui/user-avatar";
import { formatRoleLabel } from "@/lib/formatters";
import type { AdminUser } from "@/lib/api/admin";
import type { ApiErrorResponse } from "@/types/api";

type AdminUserEditFormProps = {
  user: AdminUser;
  availableRoles: string[];
};

type EditFormState = {
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

type FieldErrors = Partial<Record<keyof EditFormState, string>>;

function toInitialState(user: AdminUser): EditFormState {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    address: user.address,
    city: user.city,
    active: user.active,
    password: "",
    roles: user.roles,
  };
}

function sameRoles(first: string[], second: string[]) {
  return [...first].sort().join("|") === [...second].sort().join("|");
}

function readMessage(payload: unknown, fallback: string) {
  if (
    payload &&
    typeof payload === "object" &&
    "message" in payload &&
    typeof (payload as ApiErrorResponse).message === "string"
  ) {
    return (payload as ApiErrorResponse).message;
  }

  return fallback;
}

export function AdminUserEditForm({ user, availableRoles }: AdminUserEditFormProps) {
  const router = useRouter();
  const { notify } = useToast();
  const [form, setForm] = useState<EditFormState>(() => toInitialState(user));
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const sortedRoles = [...availableRoles].sort();

  function updateField<K extends keyof EditFormState>(field: K, value: EditFormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  }

  function toggleRole(role: string) {
    setForm((current) => {
      const nextRoles = current.roles.includes(role)
        ? current.roles.filter((item) => item !== role)
        : [...current.roles, role];

      return {
        ...current,
        roles: nextRoles.length > 0 ? nextRoles : current.roles,
      };
    });
    setFieldErrors((current) => ({ ...current, roles: undefined }));
  }

  function validate() {
    const errors: FieldErrors = {};

    if (!form.firstName.trim()) {
      errors.firstName = "Le prenom est obligatoire.";
    }

    if (!form.lastName.trim()) {
      errors.lastName = "Le nom est obligatoire.";
    }

    if (!form.email.trim() || !form.email.includes("@")) {
      errors.email = "Adresse e-mail invalide.";
    }

    if (!form.city.trim()) {
      errors.city = "La ville est obligatoire.";
    }

    if (form.password.trim() && form.password.trim().length < 8) {
      errors.password = "Le mot de passe doit contenir au moins 8 caracteres.";
    }

    if (form.roles.length === 0) {
      errors.roles = "Selectionnez au moins un role.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function submit() {
    if (!validate()) {
      setError("Verifiez les champs du formulaire.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const profileResponse = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          active: form.active,
          password: form.password.trim() ? form.password.trim() : null,
        }),
      });

      const profilePayload = (await profileResponse.json()) as AdminUser | ApiErrorResponse;
      if (!profileResponse.ok) {
        throw new Error(readMessage(profilePayload, "Impossible de modifier l utilisateur."));
      }

      if (!sameRoles(user.roles, form.roles)) {
        const rolesResponse = await fetch(`/api/admin/users/${user.id}/roles`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ roles: form.roles }),
        });

        const rolesPayload = (await rolesResponse.json()) as AdminUser | ApiErrorResponse;
        if (!rolesResponse.ok) {
          throw new Error(readMessage(rolesPayload, "Impossible de modifier les roles."));
        }
      }

      notify({
        title: "Utilisateur modifie",
        description: "Les informations du compte ont ete enregistrees.",
        type: "success",
      });
      router.push("/admin/utilisateurs");
      router.refresh();
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Impossible d enregistrer les modifications.";
      setError(message);
      notify({
        title: "Modification impossible",
        description: message,
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6">
      <section className="card p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <UserAvatar name={user.fullName} size="lg" />
            <div className="min-w-0">
              <p className="eyebrow">Compte utilisateur</p>
              <h2 className="mt-1 truncate text-2xl font-semibold text-brand-strong">
                {user.fullName}
              </h2>
              <p className="mt-1 truncate text-sm text-muted">{user.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge value={form.active ? "ACTIF" : "INACTIF"} />
            {form.roles.map((role) => (
              <StatusBadge key={role} value={role} kind="role" />
            ))}
          </div>
        </div>
      </section>

      <section className="card p-5 md:p-6">
        <div className="panel-header">
          <h2 className="panel-title">Informations du compte</h2>
          <p className="panel-copy">
            Les modifications seront appliquees directement dans la base via l API admin.
          </p>
        </div>

        {error ? (
          <div className="mt-5 rounded-[12px] border border-danger/20 bg-danger/8 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        ) : null}

        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold text-brand-strong">
              Prenom
              <input
                className="form-control"
                value={form.firstName}
                onChange={(event) => updateField("firstName", event.target.value)}
              />
              {fieldErrors.firstName ? (
                <span className="mt-2 block text-xs font-medium text-danger">
                  {fieldErrors.firstName}
                </span>
              ) : null}
            </label>

            <label className="text-sm font-semibold text-brand-strong">
              Nom
              <input
                className="form-control"
                value={form.lastName}
                onChange={(event) => updateField("lastName", event.target.value)}
              />
              {fieldErrors.lastName ? (
                <span className="mt-2 block text-xs font-medium text-danger">
                  {fieldErrors.lastName}
                </span>
              ) : null}
            </label>

            <label className="text-sm font-semibold text-brand-strong">
              Adresse e-mail
              <input
                className="form-control"
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
              />
              {fieldErrors.email ? (
                <span className="mt-2 block text-xs font-medium text-danger">
                  {fieldErrors.email}
                </span>
              ) : null}
            </label>

            <label className="text-sm font-semibold text-brand-strong">
              Telephone
              <input
                className="form-control"
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
              />
            </label>

            <label className="text-sm font-semibold text-brand-strong">
              Ville
              <input
                className="form-control"
                value={form.city}
                onChange={(event) => updateField("city", event.target.value)}
              />
              {fieldErrors.city ? (
                <span className="mt-2 block text-xs font-medium text-danger">
                  {fieldErrors.city}
                </span>
              ) : null}
            </label>

            <label className="text-sm font-semibold text-brand-strong">
              Statut
              <select
                className="form-control"
                value={form.active ? "ACTIF" : "INACTIF"}
                onChange={(event) => updateField("active", event.target.value === "ACTIF")}
              >
                <option value="ACTIF">Actif</option>
                <option value="INACTIF">Inactif</option>
              </select>
            </label>

            <label className="text-sm font-semibold text-brand-strong md:col-span-2">
              Adresse
              <input
                className="form-control"
                value={form.address}
                onChange={(event) => updateField("address", event.target.value)}
              />
            </label>

            <label className="text-sm font-semibold text-brand-strong md:col-span-2">
              Nouveau mot de passe
              <input
                className="form-control"
                type="password"
                placeholder="Laisser vide pour conserver le mot de passe actuel"
                value={form.password}
                onChange={(event) => updateField("password", event.target.value)}
              />
              {fieldErrors.password ? (
                <span className="mt-2 block text-xs font-medium text-danger">
                  {fieldErrors.password}
                </span>
              ) : (
                <span className="mt-2 block text-xs font-medium text-muted">
                  Remplir seulement si vous voulez remplacer le mot de passe.
                </span>
              )}
            </label>
          </div>

          <aside className="rounded-[18px] border border-line bg-surface-strong/70 p-4">
            <p className="text-sm font-semibold text-brand-strong">Roles autorises</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Selectionnez les espaces auxquels cet utilisateur peut acceder.
            </p>

            {fieldErrors.roles ? (
              <p className="mt-3 text-xs font-medium text-danger">{fieldErrors.roles}</p>
            ) : null}

            <div className="mt-4 grid gap-2">
              {sortedRoles.map((role) => {
                const active = form.roles.includes(role);

                return (
                  <button
                    key={role}
                    type="button"
                    className={`flex items-center justify-between rounded-[14px] border px-4 py-3 text-left text-sm font-semibold transition ${
                      active
                        ? "border-brand bg-brand text-white"
                        : "border-line bg-white text-brand-strong hover:border-brand/40"
                    }`}
                    onClick={() => toggleRole(role)}
                  >
                    <span>{formatRoleLabel(role)}</span>
                    <span aria-hidden="true">{active ? "Actif" : "Ajouter"}</span>
                  </button>
                );
              })}
            </div>
          </aside>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link href="/admin/utilisateurs" className="button-secondary justify-center">
            Annuler
          </Link>
          <button
            type="button"
            className="button-primary justify-center"
            disabled={saving}
            onClick={submit}
          >
            {saving ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </div>
      </section>
    </div>
  );
}
