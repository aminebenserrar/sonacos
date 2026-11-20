import type { CategoryCollection, Product } from "@/types/product";
import { getApiBaseUrl } from "@/lib/api/config";

const defaultVisual = {
  imageUrl: "/internet-products/wheat-field.jpg",
  accentLabel: "Catalogue SONACOS",
  description:
    "References agricoles structurees pour une consultation simple et claire.",
};

const categoryVisualMap: Record<
  string,
  { imageUrl: string; accentLabel: string; description: string }
> = {
  "Semences cereales": {
    imageUrl: "/internet-products/wheat-field.jpg",
    accentLabel: "Campagne cerealiere",
    description:
      "Ble tendre, ble dur et orge pour les besoins cerealiers de la saison.",
  },
  "Semences legumineuses": {
    imageUrl: "/internet-products/field-beans.jpg",
    accentLabel: "Legumineuses",
    description:
      "Semences pour la diversification culturale et les besoins en legumes secs.",
  },
  "Pomme de terre": {
    imageUrl: "/internet-products/potato-field.jpg",
    accentLabel: "Cultures specialisees",
    description:
      "References dediees a la pomme de terre avec conditionnements adaptes.",
  },
  "Betterave a sucre": {
    imageUrl: "/internet-products/sugar-beet-field.jpg",
    accentLabel: "Betterave",
    description:
      "Semences specialisees pour la betterave a sucre et les campagnes dediees.",
  },
  "Engrais de fond": {
    imageUrl: "/internet-products/fertilizer-granules.jpg",
    accentLabel: "Preparation du sol",
    description:
      "Engrais de fond pour structurer la fertilisation en debut de cycle.",
  },
  "Engrais de couverture": {
    imageUrl: "/internet-products/fertilizer-granules.jpg",
    accentLabel: "Nutrition des cultures",
    description:
      "Engrais de couverture pour accompagner la croissance et le suivi des cultures.",
  },
};

export function getCategoryVisual(categoryName: string) {
  return categoryVisualMap[categoryName] ?? defaultVisual;
}

export function getProductImage(product: Pick<Product, "imageUrl" | "categoryName">) {
  if (product.imageUrl?.trim()) {
    if (product.imageUrl.startsWith("/uploads/")) {
      return `${getApiBaseUrl().replace(/\/api$/, "")}${product.imageUrl}`;
    }

    return product.imageUrl;
  }

  return getCategoryVisual(product.categoryName).imageUrl;
}

export function getProductHighlights(product: Product) {
  return [
    `Reference unique ${product.reference} geree dans le catalogue SONACOS.`,
    `Conditionnement ${product.unit.toLowerCase()} avec prix affiche en dirham.`,
    product.stockQuantity <= product.alertThreshold
      ? "Stock proche du seuil d alerte, verification recommandee avant commande."
      : "Stock disponible pour une demande client ou un retrait en centre.",
  ];
}

export function enrichCategoryCollection(
  category: Omit<CategoryCollection, "imageUrl" | "accentLabel">,
): CategoryCollection {
  const visual = getCategoryVisual(category.name);

  return {
    ...category,
    imageUrl: visual.imageUrl,
    accentLabel: visual.accentLabel,
    description: category.description || visual.description,
  };
}
