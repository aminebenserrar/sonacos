"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { useToast } from "@/components/ui/toast-provider";
import { CartIcon } from "@/components/ui/store-icons";
import { formatCurrency, formatStatusLabel } from "@/lib/formatters";
import type { ApiErrorResponse } from "@/types/api";
import type { Cart, PaymentMode, ReceptionMode } from "@/types/customer";

type CustomerCartViewProps = {
  initialCart: Cart;
};

const paymentOptions: { value: PaymentMode; label: string }[] = [
  { value: "PAIEMENT_SUR_PLACE", label: "Paiement sur place" },
  { value: "VIREMENT", label: "Virement" },
  { value: "CARTE_SIMULEE", label: "Carte simulee" },
];

const receptionOptions: { value: ReceptionMode; label: string }[] = [
  { value: "RETRAIT_CENTRE", label: "Retrait centre" },
  { value: "LIVRAISON", label: "Livraison" },
];

export function CustomerCartView({ initialCart }: CustomerCartViewProps) {
  const router = useRouter();
  const { notify } = useToast();
  const [cart, setCart] = useState(initialCart);
  const [pendingItemId, setPendingItemId] = useState<number | null>(null);
  const [checkoutPending, setCheckoutPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkout, setCheckout] = useState({
    receptionMode: "RETRAIT_CENTRE" as ReceptionMode,
    paymentMode: "PAIEMENT_SUR_PLACE" as PaymentMode,
    deliveryAddress: "",
    comment: "",
  });

  async function updateQuantity(itemId: number, quantity: number) {
    setPendingItemId(itemId);
    setError(null);

    try {
      const response = await fetch(`/api/customer/cart/items/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity }),
      });

      const payload = (await response.json()) as Cart | ApiErrorResponse;
      if (!response.ok) {
        const message = (payload as ApiErrorResponse).message;
        setError(message);
        notify({ title: "Panier non mis a jour", description: message, type: "error" });
        return;
      }

      setCart(payload as Cart);
      notify({
        title: "Panier mis a jour",
        description: "La quantite a bien ete enregistree.",
        type: "success",
      });
      router.refresh();
    } catch {
      setError("Impossible de modifier le panier pour le moment.");
      notify({
        title: "Une erreur est survenue",
        description: "Veuillez reessayer.",
        type: "error",
      });
    } finally {
      setPendingItemId(null);
    }
  }

  async function removeItem(itemId: number) {
    setPendingItemId(itemId);
    setError(null);

    try {
      const response = await fetch(`/api/customer/cart/items/${itemId}`, {
        method: "DELETE",
      });

      const payload = (await response.json()) as Cart | ApiErrorResponse;
      if (!response.ok) {
        const message = (payload as ApiErrorResponse).message;
        setError(message);
        notify({ title: "Suppression impossible", description: message, type: "error" });
        return;
      }

      setCart(payload as Cart);
      notify({
        title: "Article retire",
        description: "Le produit a ete supprime du panier.",
        type: "success",
      });
      router.refresh();
    } catch {
      setError("Impossible de supprimer cet article pour le moment.");
      notify({
        title: "Une erreur est survenue",
        description: "Veuillez reessayer.",
        type: "error",
      });
    } finally {
      setPendingItemId(null);
    }
  }

  async function submitOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCheckoutPending(true);
    setCheckoutError(null);

    try {
      const response = await fetch("/api/customer/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(checkout),
      });

      const payload = (await response.json()) as
        | Record<string, unknown>
        | ApiErrorResponse;
      if (!response.ok) {
        const message = (payload as ApiErrorResponse).message;
        setCheckoutError(message);
        notify({ title: "Commande non confirmee", description: message, type: "error" });
        return;
      }

      notify({
        title: "Commande creee",
        description: "Votre commande a ete enregistree avec succes.",
        type: "success",
      });
      router.push("/espace-client/commandes");
      router.refresh();
    } catch {
      setCheckoutError("Impossible de confirmer la commande pour le moment.");
      notify({
        title: "Une erreur est survenue",
        description: "Veuillez reessayer.",
        type: "error",
      });
    } finally {
      setCheckoutPending(false);
    }
  }

  const isEmpty = cart.items.length === 0;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="card p-6">
        <div className="panel-header">
          <h2 className="panel-title">Articles du panier</h2>
          <p className="panel-copy">
            Ajustez les quantites avant de confirmer la commande.
          </p>
        </div>
        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
        {isEmpty ? (
          <div className="mt-5">
            <EmptyState
              icon={<CartIcon className="h-5 w-5" />}
              title="Panier vide"
              description="Ajoutez des produits depuis le catalogue pour preparer votre commande."
            />
          </div>
        ) : (
          <div className="table-shell mt-5">
            <div className="table-scroll">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Disponibilite</th>
                    <th>Prix unitaire</th>
                    <th>Quantite</th>
                    <th>Sous-total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="font-semibold">{item.productName}</div>
                        <div className="mt-1 text-sm text-muted">
                          {item.productReference} - {item.categoryName}
                        </div>
                      </td>
                      <td>
                        <StatusBadge value={item.availableStock > 0 ? "DISPONIBLE" : "RUPTURE"} />
                      </td>
                      <td className="table-amount">{formatCurrency(item.unitPrice)}</td>
                      <td>
                        <input
                          type="number"
                          min={1}
                          max={item.availableStock}
                          value={item.quantity}
                          className="h-10 w-24 rounded-[10px] border border-line bg-white px-3"
                          disabled={pendingItemId === item.id}
                          onChange={(event) =>
                            updateQuantity(
                              item.id,
                              Math.max(1, Number(event.target.value) || 1),
                            )
                          }
                        />
                      </td>
                      <td className="table-amount">{formatCurrency(item.subtotal)}</td>
                      <td>
                        <button
                          type="button"
                          className="button-tertiary h-10 px-3"
                          disabled={pendingItemId === item.id}
                          onClick={() => removeItem(item.id)}
                        >
                          {pendingItemId === item.id ? "..." : "Retirer"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <form className="card p-6" onSubmit={submitOrder}>
        <div className="panel-header">
          <h2 className="panel-title">Confirmation de commande</h2>
          <p className="panel-copy">
            Choisissez le mode de reception et le mode de paiement.
          </p>
        </div>

        <div className="mt-5 grid gap-3 text-sm text-muted">
          <div className="subtle-panel flex items-center justify-between px-4 py-3">
            <span>Articles</span>
            <span className="font-semibold text-brand-strong">{cart.itemsCount}</span>
          </div>
          <div className="subtle-panel flex items-center justify-between px-4 py-3">
            <span>Montant total</span>
            <span className="font-semibold text-brand-strong">
              {formatCurrency(cart.totalAmount)}
            </span>
          </div>
        </div>

        <div className="mt-5 grid gap-4">
          <div>
            <label className="text-sm font-semibold text-brand-strong">
              Mode de reception
            </label>
            <select
              className="form-control"
              value={checkout.receptionMode}
              onChange={(event) =>
                setCheckout((current) => ({
                  ...current,
                  receptionMode: event.target.value as ReceptionMode,
                }))
              }
            >
              {receptionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {checkout.receptionMode === "LIVRAISON" ? (
            <div>
              <label className="text-sm font-semibold text-brand-strong">
                Adresse de livraison
              </label>
              <textarea
                className="form-control min-h-[96px]"
                value={checkout.deliveryAddress}
                onChange={(event) =>
                  setCheckout((current) => ({
                    ...current,
                    deliveryAddress: event.target.value,
                  }))
                }
              />
            </div>
          ) : null}

          <div>
            <label className="text-sm font-semibold text-brand-strong">
              Mode de paiement
            </label>
            <select
              className="form-control"
              value={checkout.paymentMode}
              onChange={(event) =>
                setCheckout((current) => ({
                  ...current,
                  paymentMode: event.target.value as PaymentMode,
                }))
              }
            >
              {paymentOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-[14px] border border-line bg-surface-strong/65 px-4 py-3 text-sm text-muted">
            <p className="font-semibold text-brand-strong">Recapitulatif</p>
            <p className="mt-2">
              {formatStatusLabel(checkout.receptionMode)} - {formatStatusLabel(checkout.paymentMode)}
            </p>
          </div>

          <div>
            <label className="text-sm font-semibold text-brand-strong">
              Commentaire
            </label>
            <textarea
              className="form-control min-h-[96px]"
              value={checkout.comment}
              onChange={(event) =>
                setCheckout((current) => ({
                  ...current,
                  comment: event.target.value,
                }))
              }
            />
          </div>
        </div>

        {checkoutError ? (
          <p className="mt-4 text-sm text-danger">{checkoutError}</p>
        ) : null}

        <button
          type="submit"
          className="button-primary mt-6 w-full"
          disabled={isEmpty || checkoutPending}
        >
          {checkoutPending ? "Confirmation..." : "Confirmer la commande"}
        </button>
      </form>
    </div>
  );
}
