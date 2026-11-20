"use client";

import Image from "next/image";
import { useId, type ChangeEvent } from "react";
import {
  TrashIcon,
  UploadIcon,
} from "@/components/ui/store-icons";

type ImageUploadFieldProps = {
  label: string;
  previewUrl: string | null;
  helperText?: string;
  error?: string | null;
  disabled?: boolean;
  hasExistingImage?: boolean;
  onSelectFile: (file: File | null) => void;
  onRemove: () => void;
};

export function ImageUploadField({
  label,
  previewUrl,
  helperText = "PNG, JPG, JPEG, WEBP - 5 Mo maximum",
  error,
  disabled,
  hasExistingImage,
  onSelectFile,
  onRemove,
}: ImageUploadFieldProps) {
  const inputId = useId();

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onSelectFile(event.target.files?.[0] ?? null);
    event.target.value = "";
  }

  return (
    <div className="grid gap-3">
      <div>
        <p className="text-sm font-semibold text-brand-strong">{label}</p>
        <p className="mt-1 text-sm text-muted">{helperText}</p>
      </div>

      <label
        htmlFor={inputId}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[16px] border border-dashed px-5 py-7 text-center transition ${
          disabled
            ? "cursor-not-allowed border-line bg-surface-strong text-muted"
            : "border-brand/20 bg-surface-strong/60 text-brand hover:border-brand/40 hover:bg-brand/4"
        }`}
      >
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-brand/10 bg-white text-brand shadow-[0_8px_24px_rgba(24,57,38,0.08)]">
          <UploadIcon className="h-5 w-5" />
        </span>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-brand-strong">
            Deposez votre image ici
          </p>
          <p className="text-sm text-muted">
            PNG, JPG ou WEBP. Vous pouvez aussi choisir un fichier depuis votre appareil.
          </p>
        </div>
        <span className="button-secondary">Choisir depuis la galerie</span>
      </label>

      <input
        id={inputId}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        disabled={disabled}
        onChange={handleChange}
      />

      {previewUrl ? (
        <div className="rounded-[18px] border border-line bg-white p-3">
          <div className="relative aspect-[16/10] overflow-hidden rounded-[14px] bg-surface-strong">
            <Image
              src={previewUrl}
              alt="Apercu du produit"
              fill
              unoptimized
              className="object-cover"
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-muted">
              <p className="font-semibold text-brand-strong">Apercu selectionne</p>
              <p>Verifiez le cadrage avant l enregistrement.</p>
            </div>
            <div className="flex flex-wrap gap-3">
            <label htmlFor={inputId} className="button-secondary cursor-pointer">
              Changer l image
            </label>
            <button
              type="button"
              className="button-tertiary text-danger hover:bg-danger/6"
              onClick={onRemove}
              disabled={disabled}
            >
              <TrashIcon className="h-4 w-4" />
              {hasExistingImage ? "Supprimer l image" : "Retirer l apercu"}
            </button>
            </div>
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="text-sm font-medium text-danger">{error}</p>
      ) : null}
    </div>
  );
}
