"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ApiErrorResponse } from "@/types/api";

type AddToCartButtonProps = {
  productId: number;
  disabled?: boolean;
};

export function AddToCartButton({
  productId,
  disabled = false,
}: AddToCartButtonProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/customer/cart/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity,
        }),
      });

      const payload = (await response.json()) as
        | { message?: string }
        | ApiErrorResponse;

      if (!response.ok) {
        setError((payload as ApiErrorResponse).message);
        return;
      }

      setMessage("Produit ajoute au panier.");
      router.refresh();
    } catch {
      setError("Impossible d ajouter ce produit au panier pour le moment.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="grid gap-3" onSubmit={handleSubmit}>
      <div className="flex gap-3">
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
          className="form-control max-w-[110px]"
          disabled={disabled || pending}
        />
        <button
          type="submit"
          className="button-primary flex-1"
          disabled={disabled || pending}
        >
          {pending ? "Ajout..." : "Ajouter au panier"}
        </button>
      </div>
      {message ? <p className="text-sm text-brand">{message}</p> : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </form>
  );
}
