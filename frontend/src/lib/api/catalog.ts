import type { PageResponse } from "@/types/api";
import type { Category, CategoryCollection, Product } from "@/types/product";
import { apiRequest } from "@/lib/api/http";
import { enrichCategoryCollection } from "@/lib/catalog-ui";

type BackendCategoryResponse = {
  id: number;
  name: string;
  description: string;
  active: boolean;
};

type BackendProductResponse = {
  id: number;
  slug: string;
  reference: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  unit: string;
  imageUrl: string;
  stockQuantity: number;
  alertThreshold: number;
  active: boolean;
  featured: boolean;
  categoryId: number;
  categoryName: string;
  createdAt: string;
  updatedAt: string;
};

export type PublicProductsQuery = {
  search?: string;
  categoryId?: number;
  available?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  page?: number;
  size?: number;
};

function mapCategory(category: BackendCategoryResponse): Category {
  return {
    id: category.id,
    name: category.name,
    description: category.description,
    active: category.active,
  };
}

function mapProduct(product: BackendProductResponse): Product {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    reference: product.reference,
    categoryId: product.categoryId,
    categoryName: product.categoryName,
    imageUrl: product.imageUrl ?? "",
    price: Number(product.price),
    stockQuantity: product.stockQuantity,
    alertThreshold: product.alertThreshold,
    unit: product.unit,
    shortDescription: product.shortDescription,
    fullDescription: product.fullDescription,
    active: product.active,
    featured: product.featured,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

export async function getManagedProducts(token: string, page = 0, size = 100) {
  const response = await apiRequest<PageResponse<BackendProductResponse>>(
    "/products",
    {
      token,
      query: {
        page,
        size,
      },
    },
  );

  return {
    ...response,
    content: response.content.map(mapProduct),
  };
}

export async function getPublicCategories() {
  const categories = await apiRequest<BackendCategoryResponse[]>("/public/categories");
  return categories.map(mapCategory);
}

export async function getPublicProducts(query: PublicProductsQuery = {}) {
  const response = await apiRequest<PageResponse<BackendProductResponse>>(
    "/public/products",
    {
      query: {
        search: query.search,
        categoryId: query.categoryId,
        available: query.available,
        minPrice: query.minPrice,
        maxPrice: query.maxPrice,
        sortBy: query.sortBy ?? "name",
        sortDirection: query.sortDirection ?? "asc",
        page: query.page ?? 0,
        size: query.size ?? 20,
      },
    },
  );

  return {
    ...response,
    content: response.content.map(mapProduct),
  };
}

export async function getFeaturedProducts() {
  const products = await apiRequest<BackendProductResponse[]>(
    "/public/products/featured",
  );

  return products.map(mapProduct);
}

export async function getPublicProductBySlug(slug: string) {
  const product = await apiRequest<BackendProductResponse>(
    `/public/products/${slug}`,
  );

  return mapProduct(product);
}

export async function getHomeCategoryCollections(): Promise<CategoryCollection[]> {
  const [categories, productsPage] = await Promise.all([
    getPublicCategories(),
    getPublicProducts({ page: 0, size: 100 }),
  ]);

  const counts = new Map<number, number>();
  for (const product of productsPage.content) {
    counts.set(product.categoryId, (counts.get(product.categoryId) ?? 0) + 1);
  }

  return categories.map((category) =>
    enrichCategoryCollection({
      id: category.id,
      name: category.name,
      description: category.description,
      count: counts.get(category.id) ?? 0,
    }),
  );
}
