export type Product = {
  id: number;
  slug: string;
  name: string;
  reference: string;
  categoryId: number;
  categoryName: string;
  imageUrl: string;
  price: number;
  stockQuantity: number;
  alertThreshold: number;
  unit: string;
  shortDescription: string;
  fullDescription: string;
  active: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: number;
  name: string;
  description: string;
  active: boolean;
};

export type CategoryCollection = {
  id: number;
  name: string;
  description: string;
  count: number;
  imageUrl: string;
  accentLabel: string;
};
