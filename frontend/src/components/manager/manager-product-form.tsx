"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ImageUploadField } from "@/components/ui/image-upload-field";
import { StatusBadge } from "@/components/ui/status-badge";
import { useToast } from "@/components/ui/toast-provider";
import { getProductImage } from "@/lib/catalog-ui";
import type { ApiErrorResponse } from "@/types/api";
import type { Category, Product } from "@/types/product";

type ProductFormMode = "create" | "edit";

type ManagerProductFormProps = {
  mode: ProductFormMode;
  categories: Category[];
  product?: Product;
};

type ProductFormState = {
  name: string;
  reference: string;
  categoryId: string;
  price: string;
  unit: string;
  stockQuantity: string;
  alertThreshold: string;
  shortDescription: string;
  fullDescription: string;
  active: boolean;
  featured: boolean;
};

type FieldErrors = Partial<Record<keyof ProductFormState, string>>;

const EMPTY_FORM: ProductFormState = {
  name: "",
  reference: "",
  categoryId: "",
  price: "",
  unit: "q",
  stockQuantity: "0",
  alertThreshold: "10",
  shortDescription: "",
  fullDescription: "",
  active: true,
  featured: false,
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toInitialForm(product: Product | undefined, categories: Category[]) {
  if (!product) {
    return {
      ...EMPTY_FORM,
      categoryId: categories[0]?.id?.toString() ?? "",
    };
  }

  return {
    name: product.name,
    reference: product.reference,
    categoryId: String(product.categoryId),
    price: String(product.price),
    unit: product.unit,
    stockQuantity: String(product.stockQuantity),
    alertThreshold: String(product.alertThreshold),
    shortDescription: product.shortDescription,
    fullDescription: product.fullDescription,
    active: product.active,
    featured: product.featured,
  };
}

function toPayload(form: ProductFormState) {
  return {
    slug: slugify(`${form.name}-${form.reference}`),
    reference: form.reference.trim(),
    name: form.name.trim(),
    shortDescription: form.shortDescription.trim(),
    fullDescription: form.fullDescription.trim(),
    price: Number(form.price),
    unit: form.unit.trim(),
    stockQuantity: Number(form.stockQuantity),
    alertThreshold: Number(form.alertThreshold),
    categoryId: Number(form.categoryId),
    active: form.active,
    featured: form.featured,
  };
}

function readErrorMessage(payload: Product | ApiErrorResponse, fallback: string) {
  return "message" in payload && payload.message ? payload.message : fallback;
}

function validateImage(file: File | null) {
  if (!file) {
    return null;
  }

  if (file.size === 0) {
    return "Veuillez selectionner une image produit valide.";
  }

  if (file.size > 5 * 1024 * 1024) {
    return "L image ne doit pas depasser 5 Mo.";
  }

  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
    return "Le fichier doit etre une image JPG, PNG ou WEBP.";
  }

  return null;
}

export function ManagerProductForm({
  mode,
  categories,
  product,
}: ManagerProductFormProps) {
  const router = useRouter();
  const { notify } = useToast();
  const [form, setForm] = useState<ProductFormState>(() =>
    toInitialForm(product, categories),
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(
    product?.imageUrl ? getProductImage(product) : null,
  );
  const [removeExistingImage, setRemoveExistingImage] = useState(false);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  function updateField<K extends keyof ProductFormState>(
    field: K,
    value: ProductFormState[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validate() {
    const errors: FieldErrors = {};

    if (!form.name.trim()) {
      errors.name = "Le nom du produit est obligatoire.";
    }

    if (!form.reference.trim()) {
      errors.reference = "La reference est obligatoire.";
    }

    if (!form.categoryId) {
      errors.categoryId = "Selectionnez une categorie.";
    }

    if (!form.price || Number(form.price) <= 0) {
      errors.price = "Le prix doit etre superieur a 0.";
    }

    if (!form.unit.trim()) {
      errors.unit = "L unite est obligatoire.";
    }

    if (Number(form.stockQuantity) < 0) {
      errors.stockQuantity = "Le stock ne peut pas etre negatif.";
    }

    if (Number(form.alertThreshold) < 0) {
      errors.alertThreshold = "Le seuil ne peut pas etre negatif.";
    }

    if (!form.shortDescription.trim()) {
      errors.shortDescription = "La description courte est obligatoire.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleImageSelection(file: File | null) {
    setImageError(null);

    if (!file) {
      return;
    }

    const validationError = validateImage(file);
    if (validationError) {
      setImageError(validationError);
      return;
    }

    if (imagePreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    setSelectedImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    setRemoveExistingImage(false);
  }

  function handleRemoveImage() {
    if (imagePreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    setSelectedImageFile(null);
    setImagePreviewUrl(null);
    setImageError(null);
    setRemoveExistingImage(Boolean(product?.imageUrl));
  }

  async function persistImage(savedProduct: Product) {
    if (selectedImageFile) {
      const formData = new FormData();
      formData.append("image", selectedImageFile);

      const response = await fetch(`/api/manager/products/${savedProduct.id}/image`, {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as Product | ApiErrorResponse;

      if (!response.ok) {
        throw new Error(
          readErrorMessage(data, "Le produit est enregistre, mais pas son image."),
        );
      }
    } else if (removeExistingImage && product?.imageUrl) {
      const response = await fetch(`/api/manager/products/${savedProduct.id}/image`, {
        method: "DELETE",
      });
      const data = (await response.json()) as Product | ApiErrorResponse;

      if (!response.ok) {
        throw new Error(
          readErrorMessage(data, "Le produit est enregistre, mais l image reste en place."),
        );
      }
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validate()) {
      setError("Verifiez les champs du formulaire.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setImageError(null);

    try {
      const isEdit = mode === "edit" && product;
      const response = await fetch(
        isEdit ? `/api/manager/products/${product.id}` : "/api/manager/products",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(toPayload(form)),
        },
      );

      const data = (await response.json()) as Product | ApiErrorResponse;
      if (!response.ok) {
        throw new Error(readErrorMessage(data, "Impossible d enregistrer le produit."));
      }

      try {
        await persistImage(data as Product);
      } catch (imagePersistenceError) {
        const message =
          imagePersistenceError instanceof Error
            ? imagePersistenceError.message
            : "Le produit est enregistre, mais pas son image.";
        notify({
          title: "Produit enregistre partiellement",
          description: message,
          type: "info",
        });
        router.push("/gestionnaire/produits");
        router.refresh();
        return;
      }

      notify({
        title: mode === "create" ? "Produit cree" : "Produit modifie",
        description:
          mode === "create"
            ? "La nouvelle reference est disponible dans le catalogue."
            : "Les informations du produit ont ete enregistrees.",
        type: "success",
      });
      router.push("/gestionnaire/produits");
      router.refresh();
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Impossible d enregistrer le produit.";
      setError(message);
      notify({
        title: "Enregistrement impossible",
        description: message,
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="grid gap-6" onSubmit={handleSubmit}>
      {error ? (
        <div className="rounded-[12px] border border-danger/20 bg-danger/8 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      ) : null}

      <section className="card p-5 md:p-6">
        <div className="panel-header">
          <h2 className="panel-title">Informations generales</h2>
          <p className="panel-copy">Identifiez clairement le produit dans le catalogue.</p>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold text-brand-strong">
            Nom du produit
            <input
              className="form-control"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
            />
            {fieldErrors.name ? (
              <span className="mt-2 block text-xs text-danger">{fieldErrors.name}</span>
            ) : null}
          </label>
          <label className="text-sm font-semibold text-brand-strong">
            Reference
            <input
              className="form-control"
              value={form.reference}
              onChange={(event) => updateField("reference", event.target.value)}
            />
            {fieldErrors.reference ? (
              <span className="mt-2 block text-xs text-danger">
                {fieldErrors.reference}
              </span>
            ) : null}
          </label>
          <label className="text-sm font-semibold text-brand-strong">
            Categorie
            <select
              className="form-control"
              value={form.categoryId}
              onChange={(event) => updateField("categoryId", event.target.value)}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {fieldErrors.categoryId ? (
              <span className="mt-2 block text-xs text-danger">
                {fieldErrors.categoryId}
              </span>
            ) : null}
          </label>
          <label className="text-sm font-semibold text-brand-strong">
            Unite
            <input
              className="form-control"
              value={form.unit}
              onChange={(event) => updateField("unit", event.target.value)}
            />
            {fieldErrors.unit ? (
              <span className="mt-2 block text-xs text-danger">{fieldErrors.unit}</span>
            ) : null}
          </label>
          <label className="text-sm font-semibold text-brand-strong md:col-span-2">
            Description courte
            <textarea
              className="form-control min-h-[92px] py-3"
              value={form.shortDescription}
              onChange={(event) => updateField("shortDescription", event.target.value)}
            />
            {fieldErrors.shortDescription ? (
              <span className="mt-2 block text-xs text-danger">
                {fieldErrors.shortDescription}
              </span>
            ) : null}
          </label>
          <label className="text-sm font-semibold text-brand-strong md:col-span-2">
            Description detaillee
            <textarea
              className="form-control min-h-[132px] py-3"
              value={form.fullDescription}
              onChange={(event) => updateField("fullDescription", event.target.value)}
            />
          </label>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <section className="card p-5 md:p-6">
          <div className="panel-header">
            <h2 className="panel-title">Tarification et stock</h2>
            <p className="panel-copy">Gardez des prix en MAD et des seuils lisibles.</p>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold text-brand-strong">
              Prix
              <input
                className="form-control"
                type="number"
                min="0.01"
                step="0.01"
                value={form.price}
                onChange={(event) => updateField("price", event.target.value)}
              />
              {fieldErrors.price ? (
                <span className="mt-2 block text-xs text-danger">{fieldErrors.price}</span>
              ) : null}
            </label>
            <label className="text-sm font-semibold text-brand-strong">
              Quantite en stock
              <input
                className="form-control"
                type="number"
                min="0"
                value={form.stockQuantity}
                onChange={(event) => updateField("stockQuantity", event.target.value)}
              />
              {fieldErrors.stockQuantity ? (
                <span className="mt-2 block text-xs text-danger">
                  {fieldErrors.stockQuantity}
                </span>
              ) : null}
            </label>
            <label className="text-sm font-semibold text-brand-strong">
              Seuil d alerte
              <input
                className="form-control"
                type="number"
                min="0"
                value={form.alertThreshold}
                onChange={(event) => updateField("alertThreshold", event.target.value)}
              />
              {fieldErrors.alertThreshold ? (
                <span className="mt-2 block text-xs text-danger">
                  {fieldErrors.alertThreshold}
                </span>
              ) : null}
            </label>
            <div className="rounded-[16px] border border-line bg-surface-strong/70 p-4">
              <p className="text-sm font-semibold text-brand-strong">Publication</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <StatusBadge value={form.active ? "ACTIF" : "INACTIF"} />
                {form.featured ? <StatusBadge value="VALIDEE" /> : null}
              </div>
            </div>
          </div>
        </section>

        <section className="card p-5 md:p-6">
          <div className="panel-header">
            <h2 className="panel-title">Image</h2>
            <p className="panel-copy">Ajoutez une image claire pour le catalogue public.</p>
          </div>
          <div className="mt-5">
            <ImageUploadField
              label="Image du produit"
              previewUrl={imagePreviewUrl}
              error={imageError}
              disabled={submitting}
              hasExistingImage={Boolean(product?.imageUrl)}
              onSelectFile={handleImageSelection}
              onRemove={handleRemoveImage}
            />
          </div>
        </section>
      </div>

      <section className="card p-5 md:p-6">
        <div className="panel-header">
          <h2 className="panel-title">Statut et mise en avant</h2>
          <p className="panel-copy">Controlez la visibilite du produit dans l application.</p>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <label className="flex items-center gap-3 rounded-[16px] border border-line bg-surface-strong/60 p-4 text-sm font-semibold text-brand-strong">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(event) => updateField("active", event.target.checked)}
            />
            Produit actif dans le catalogue
          </label>
          <label className="flex items-center gap-3 rounded-[16px] border border-line bg-surface-strong/60 p-4 text-sm font-semibold text-brand-strong">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(event) => updateField("featured", event.target.checked)}
            />
            Mettre en avant sur l accueil
          </label>
        </div>
      </section>

      <div className="sticky bottom-0 z-10 -mx-4 border-t border-line bg-background/95 px-4 py-4 backdrop-blur md:-mx-6 md:px-6">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link href="/gestionnaire/produits" className="button-secondary justify-center">
            Annuler
          </Link>
          <button
            type="submit"
            className="button-primary justify-center"
            disabled={submitting}
          >
            {submitting
              ? mode === "create"
                ? "Creation en cours..."
                : "Enregistrement..."
              : mode === "create"
                ? "Ajouter le produit"
                : "Enregistrer les modifications"}
          </button>
        </div>
      </div>
    </form>
  );
}
