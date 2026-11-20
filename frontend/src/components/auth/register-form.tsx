"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ApiErrorResponse } from "@/types/api";

type RegisterFormState = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  password: string;
  confirmPassword: string;
};

const initialForm: RegisterFormState = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  password: "",
  confirmPassword: "",
};

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState<RegisterFormState>(initialForm);
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function updateField<K extends keyof RegisterFormState>(
    key: K,
    value: RegisterFormState[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setFormError(null);
    setFieldErrors({});

    if (form.password !== form.confirmPassword) {
      setFieldErrors({
        confirmPassword: "La confirmation du mot de passe ne correspond pas.",
      });
      setPending(false);
      return;
    }

    try {
      const response = await fetch("/api/session/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          email: form.email,
          address: form.address,
          city: form.city,
          password: form.password,
        }),
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
      setFormError("Impossible de creer le compte pour le moment.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
      <div className="md:col-span-2 flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">mon espace</p>
          <h2 className="mt-2 font-heading text-2xl font-bold text-brand-strong md:text-3xl">
            Inscription
          </h2>
        </div>
        <Link href="/login" className="text-sm font-semibold text-brand">
          J&apos;ai deja un compte
        </Link>
      </div>

      {formError ? (
        <div className="md:col-span-2 rounded-[12px] border border-danger/20 bg-danger/8 px-4 py-3 text-sm text-danger">
          {formError}
        </div>
      ) : null}

      <div>
        <label className="text-sm font-semibold text-brand-strong" htmlFor="firstName">
          Prenom
        </label>
        <input
          id="firstName"
          type="text"
          placeholder="Amine"
          className="form-control"
          value={form.firstName}
          onChange={(event) => updateField("firstName", event.target.value)}
        />
        {fieldErrors.firstName ? (
          <p className="mt-2 text-sm text-danger">{fieldErrors.firstName}</p>
        ) : null}
      </div>

      <div>
        <label className="text-sm font-semibold text-brand-strong" htmlFor="lastName">
          Nom
        </label>
        <input
          id="lastName"
          type="text"
          placeholder="El Idrissi"
          className="form-control"
          value={form.lastName}
          onChange={(event) => updateField("lastName", event.target.value)}
        />
        {fieldErrors.lastName ? (
          <p className="mt-2 text-sm text-danger">{fieldErrors.lastName}</p>
        ) : null}
      </div>

      <div>
        <label className="text-sm font-semibold text-brand-strong" htmlFor="phone">
          Telephone
        </label>
        <input
          id="phone"
          type="text"
          placeholder="+212 6 00 00 00 00"
          className="form-control"
          value={form.phone}
          onChange={(event) => updateField("phone", event.target.value)}
        />
        {fieldErrors.phone ? (
          <p className="mt-2 text-sm text-danger">{fieldErrors.phone}</p>
        ) : null}
      </div>

      <div>
        <label className="text-sm font-semibold text-brand-strong" htmlFor="city">
          Ville
        </label>
        <input
          id="city"
          type="text"
          placeholder="Casablanca"
          className="form-control"
          value={form.city}
          onChange={(event) => updateField("city", event.target.value)}
        />
        {fieldErrors.city ? (
          <p className="mt-2 text-sm text-danger">{fieldErrors.city}</p>
        ) : null}
      </div>

      <div className="md:col-span-2">
        <label className="text-sm font-semibold text-brand-strong" htmlFor="email">
          Adresse e-mail
        </label>
        <input
          id="email"
          type="email"
          placeholder="client@sonacos.ma"
          className="form-control"
          value={form.email}
          onChange={(event) => updateField("email", event.target.value)}
        />
        {fieldErrors.email ? (
          <p className="mt-2 text-sm text-danger">{fieldErrors.email}</p>
        ) : null}
      </div>

      <div className="md:col-span-2">
        <label className="text-sm font-semibold text-brand-strong" htmlFor="address">
          Adresse
        </label>
        <input
          id="address"
          type="text"
          placeholder="Casablanca, Maroc"
          className="form-control"
          value={form.address}
          onChange={(event) => updateField("address", event.target.value)}
        />
        {fieldErrors.address ? (
          <p className="mt-2 text-sm text-danger">{fieldErrors.address}</p>
        ) : null}
      </div>

      <div>
        <label className="text-sm font-semibold text-brand-strong" htmlFor="password">
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          placeholder="********"
          className="form-control"
          value={form.password}
          onChange={(event) => updateField("password", event.target.value)}
        />
        {fieldErrors.password ? (
          <p className="mt-2 text-sm text-danger">{fieldErrors.password}</p>
        ) : null}
      </div>

      <div>
        <label
          className="text-sm font-semibold text-brand-strong"
          htmlFor="confirmPassword"
        >
          Confirmation
        </label>
        <input
          id="confirmPassword"
          type="password"
          placeholder="********"
          className="form-control"
          value={form.confirmPassword}
          onChange={(event) => updateField("confirmPassword", event.target.value)}
        />
        {fieldErrors.confirmPassword ? (
          <p className="mt-2 text-sm text-danger">{fieldErrors.confirmPassword}</p>
        ) : null}
      </div>

      <div className="md:col-span-2 flex justify-end">
        <button type="submit" className="button-primary" disabled={pending}>
          {pending ? "Creation..." : "Creer mon compte"}
        </button>
      </div>
    </form>
  );
}
