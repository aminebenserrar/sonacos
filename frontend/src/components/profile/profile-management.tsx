"use client";

import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  EditIcon,
  EyeIcon,
  LockIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
} from "@/components/ui/store-icons";
import { useToast } from "@/components/ui/toast-provider";
import { UserAvatar } from "@/components/ui/user-avatar";
import { formatDateLong, formatRoleLabel } from "@/lib/formatters";
import type { ApiErrorResponse } from "@/types/api";
import type { UpdateProfilePayload, UserProfile } from "@/types/auth";

type ProfileManagementProps = {
  initialProfile: UserProfile;
};

type PasswordFieldName = "currentPassword" | "newPassword" | "confirmPassword";

export function ProfileManagement({ initialProfile }: ProfileManagementProps) {
  const router = useRouter();
  const { notify } = useToast();
  const [profile, setProfile] = useState(initialProfile);
  const [editing, setEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<PasswordFieldName, boolean>>({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [draft, setDraft] = useState<UpdateProfilePayload>({
    firstName: initialProfile.firstName,
    lastName: initialProfile.lastName,
    email: initialProfile.email,
    phone: initialProfile.phone,
    address: initialProfile.address,
    city: initialProfile.city,
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  function updateDraft<K extends keyof UpdateProfilePayload>(
    key: K,
    value: UpdateProfilePayload[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function resetDraft() {
    setDraft({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone,
      address: profile.address,
      city: profile.city,
    });
  }

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingProfile(true);
    setProfileError(null);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });

      const data = (await response.json()) as UserProfile | ApiErrorResponse;

      if (!response.ok) {
        const message =
          (data as ApiErrorResponse).message ?? "Impossible de mettre à jour le profil.";
        setProfileError(message);
        notify({
          title: "Mise à jour impossible",
          description: message,
          type: "error",
        });
        return;
      }

      setProfile(data as UserProfile);
      setEditing(false);
      notify({
        title: "Profil mis à jour",
        description: "Vos informations personnelles ont été enregistrées.",
        type: "success",
      });
      router.refresh();
    } catch {
      setProfileError("Impossible de mettre à jour le profil.");
      notify({
        title: "Impossible de mettre à jour le profil.",
        type: "error",
      });
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError(null);

    if (passwordForm.newPassword.length < 8) {
      setPasswordError("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("La confirmation du mot de passe ne correspond pas.");
      return;
    }

    setChangingPassword(true);

    try {
      const response = await fetch("/api/profile/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = response.status === 200
        ? ((await response.json()) as { success: true })
        : ((await response.json()) as ApiErrorResponse);

      if (!response.ok) {
        const message =
          (data as ApiErrorResponse).message ?? "Impossible de changer le mot de passe.";
        setPasswordError(message);
        notify({
          title: "Changement impossible",
          description: message,
          type: "error",
        });
        return;
      }

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      notify({
        title: "Mot de passe mis à jour",
        description: "Votre mot de passe a été modifié avec succès.",
        type: "success",
      });
    } catch {
      setPasswordError("Impossible de changer le mot de passe.");
      notify({
        title: "Impossible de changer le mot de passe.",
        type: "error",
      });
    } finally {
      setChangingPassword(false);
    }
  }

  function renderTextField(
    label: string,
    key: keyof UpdateProfilePayload,
    icon: ReactNode,
    type = "text",
  ) {
    return (
      <label className="text-sm font-semibold text-brand-strong">
        <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-brand-strong">
          {icon}
          {label}
        </span>
        <input
          type={type}
          className="form-control mt-0"
          value={draft[key]}
          onChange={(event) => updateDraft(key, event.target.value)}
          disabled={!editing || savingProfile}
        />
      </label>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="card p-5">
        <div className="flex items-start gap-4">
          <UserAvatar name={profile.fullName} size="lg" />
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-brand-strong">{profile.fullName}</h2>
            <p className="mt-1 truncate text-sm text-muted">{profile.email}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {profile.roles.map((role) => (
                <StatusBadge key={role} value={role} kind="role" />
              ))}
              <StatusBadge value={profile.active ? "ACTIF" : "INACTIF"} />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3">
          <div className="subtle-panel p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Compte créé</p>
            <p className="mt-2 text-sm font-semibold text-brand-strong">
              {formatDateLong(profile.createdAt)}
            </p>
          </div>
          <div className="subtle-panel p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Rôle principal</p>
            <p className="mt-2 text-sm font-semibold text-brand-strong">
              {formatRoleLabel(profile.roles[0] ?? "CLIENT")}
            </p>
          </div>
          <div className="subtle-panel p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Ville</p>
            <p className="mt-2 text-sm font-semibold text-brand-strong">{profile.city}</p>
          </div>
        </div>
      </aside>

      <div className="grid gap-6">
        <section className="card p-5">
          <div className="flex flex-col gap-4 border-b border-line pb-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="eyebrow">Informations personnelles</p>
              <h2 className="mt-2 text-xl font-semibold text-brand-strong">Mon profil</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                Mettez à jour vos coordonnées personnelles et les informations visibles dans votre compte.
              </p>
            </div>

            {!editing ? (
              <button
                type="button"
                className="button-primary"
                onClick={() => {
                  resetDraft();
                  setEditing(true);
                  setProfileError(null);
                }}
              >
                <EditIcon className="h-4 w-4" />
                Modifier
              </button>
            ) : null}
          </div>

          {profileError ? (
            <div className="mt-4 rounded-[10px] border border-danger/20 bg-danger/8 px-4 py-3 text-sm text-danger">
              {profileError}
            </div>
          ) : null}

          <form className="mt-5 grid gap-6" onSubmit={handleProfileSubmit}>
            <div>
              <p className="mb-4 text-sm font-semibold text-brand-strong">Identité</p>
              <div className="grid gap-4 md:grid-cols-2">
                {renderTextField("Prénom", "firstName", <UserIcon className="h-4 w-4 text-brand" />)}
                {renderTextField("Nom", "lastName", <UserIcon className="h-4 w-4 text-brand" />)}
                {renderTextField("E-mail", "email", <MailIcon className="h-4 w-4 text-brand" />, "email")}
                {renderTextField("Téléphone", "phone", <PhoneIcon className="h-4 w-4 text-brand" />)}
              </div>
            </div>

            <div>
              <p className="mb-4 text-sm font-semibold text-brand-strong">Coordonnées</p>
              <div className="grid gap-4 md:grid-cols-2">
                {renderTextField("Ville", "city", <MapPinIcon className="h-4 w-4 text-brand" />)}
                {renderTextField("Adresse", "address", <MapPinIcon className="h-4 w-4 text-brand" />)}
              </div>
            </div>

            {editing ? (
              <div className="flex flex-wrap justify-end gap-3 border-t border-line pt-4">
                <button
                  type="button"
                  className="button-secondary"
                  onClick={() => {
                    resetDraft();
                    setEditing(false);
                    setProfileError(null);
                  }}
                  disabled={savingProfile}
                >
                  Annuler
                </button>
                <button type="submit" className="button-primary" disabled={savingProfile}>
                  {savingProfile ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            ) : null}
          </form>
        </section>

        <section className="card p-5">
          <div className="border-b border-line pb-4">
            <p className="eyebrow">Sécurité</p>
            <h2 className="mt-2 text-xl font-semibold text-brand-strong">Changer le mot de passe</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Saisissez votre mot de passe actuel, puis définissez un nouveau mot de passe sécurisé.
            </p>
          </div>

          {passwordError ? (
            <div className="mt-4 rounded-[10px] border border-danger/20 bg-danger/8 px-4 py-3 text-sm text-danger">
              {passwordError}
            </div>
          ) : null}

          <form className="mt-5 grid gap-4 md:max-w-2xl" onSubmit={handlePasswordSubmit}>
            {(["currentPassword", "newPassword", "confirmPassword"] as PasswordFieldName[]).map(
              (fieldName) => {
                const labels: Record<PasswordFieldName, string> = {
                  currentPassword: "Mot de passe actuel",
                  newPassword: "Nouveau mot de passe",
                  confirmPassword: "Confirmer le nouveau mot de passe",
                };

                return (
                  <label key={fieldName} className="text-sm font-semibold text-brand-strong">
                    <span className="mb-2 flex items-center gap-2">
                      <LockIcon className="h-4 w-4 text-brand" />
                      {labels[fieldName]}
                    </span>
                    <div className="relative">
                      <input
                        type={showPasswords[fieldName] ? "text" : "password"}
                        className="form-control mt-0 pr-11"
                        value={passwordForm[fieldName]}
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                          setPasswordForm((current) => ({
                            ...current,
                            [fieldName]: event.target.value,
                          }))
                        }
                        disabled={changingPassword}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-brand"
                        onClick={() =>
                          setShowPasswords((current) => ({
                            ...current,
                            [fieldName]: !current[fieldName],
                          }))
                        }
                        aria-label={`Afficher ou masquer ${labels[fieldName]}`}
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </label>
                );
              },
            )}

            <div className="flex justify-end pt-2">
              <button type="submit" className="button-primary" disabled={changingPassword}>
                {changingPassword ? "Mise à jour..." : "Changer le mot de passe"}
              </button>
            </div>
          </form>
        </section>

        <section className="card p-5">
          <div className="border-b border-line pb-4">
            <p className="eyebrow">Compte</p>
            <h2 className="mt-2 text-xl font-semibold text-brand-strong">Informations du compte</h2>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="subtle-panel p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Rôles</p>
              <p className="mt-2 text-sm font-semibold text-brand-strong">
                {profile.roles.map((role) => formatRoleLabel(role)).join(" · ")}
              </p>
            </div>
            <div className="subtle-panel p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Statut</p>
              <div className="mt-2">
                <StatusBadge value={profile.active ? "ACTIF" : "INACTIF"} />
              </div>
            </div>
            <div className="subtle-panel p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Créé le</p>
              <p className="mt-2 text-sm font-semibold text-brand-strong">
                {formatDateLong(profile.createdAt)}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
