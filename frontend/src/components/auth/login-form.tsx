"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EyeIcon } from "@/components/ui/store-icons";
import type { ApiErrorResponse } from "@/types/api";

type LoginFormState = {
  email: string;
  password: string;
};

export function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState<LoginFormState>({
    email: "",
    password: "",
  });
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setFormError(null);
    setFieldErrors({});

    try {
      const response = await fetch("/api/session/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = (await response.json()) as
        | { redirectPath: string }
        | ApiErrorResponse;

      if (!response.ok) {
        const errorPayload = payload as ApiErrorResponse;
        setFormError(errorPayload.message);
        setFieldErrors(errorPayload.validationErrors ?? {});
        return;
      }

      router.push((payload as { redirectPath: string }).redirectPath);
      router.refresh();
    } catch {
      setFormError("Impossible de se connecter pour le moment.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">espace securise</p>
          <h2 className="mt-2 font-heading text-2xl font-bold text-brand-strong md:text-3xl">
            Se connecter
          </h2>
        </div>
        <Link href="/register" className="text-sm font-semibold text-brand">
          Creer un compte
        </Link>
      </div>

      {formError ? (
        <div className="rounded-[12px] border border-danger/20 bg-danger/8 px-4 py-3 text-sm text-danger">
          {formError}
        </div>
      ) : null}

      <div>
        <label className="text-sm font-semibold text-brand-strong" htmlFor="email">
          Adresse e-mail
        </label>
        <input
          id="email"
          type="email"
          placeholder="client@sonacos.ma"
          className="form-control"
          value={form.email}
          onChange={(event) =>
            setForm((current) => ({ ...current, email: event.target.value }))
          }
        />
        {fieldErrors.email ? (
          <p className="mt-2 text-sm text-danger">{fieldErrors.email}</p>
        ) : null}
      </div>

      <div>
        <label
          className="text-sm font-semibold text-brand-strong"
          htmlFor="password"
        >
          Mot de passe
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="********"
            className="form-control pr-12"
            value={form.password}
            onChange={(event) =>
              setForm((current) => ({ ...current, password: event.target.value }))
            }
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-full p-2 text-muted transition hover:bg-brand/5 hover:text-brand"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            <EyeIcon className="h-4 w-4" />
          </button>
        </div>
        {fieldErrors.password ? (
          <p className="mt-2 text-sm text-danger">{fieldErrors.password}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <label className="inline-flex items-center gap-3 font-medium text-brand-strong">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
          />
          Se souvenir de moi
        </label>
        <span>Acces securise par role</span>
      </div>

      <button type="submit" className="button-primary w-full" disabled={pending}>
        {pending ? "Connexion..." : "Se connecter"}
      </button>

      <div className="flex items-center justify-between gap-4 text-sm text-muted">
        <Link href="/catalogue" className="font-semibold text-brand">
          Retour au catalogue
        </Link>
        <span>Mot de passe oublie</span>
      </div>
    </form>
  );
}
