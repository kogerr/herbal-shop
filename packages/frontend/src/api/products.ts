import type { Product, ProductWithCategory } from "@webshop/shared";
import { apiFetch } from "./client";

type ProductListResponse = {
  page: number;
  products: Product[];
  total: number;
  totalPages: number;
};

export const fetchProducts = (category?: string): Promise<ProductListResponse> => {
  const params = category ? `?category=${encodeURIComponent(category)}` : "";
  return apiFetch<ProductListResponse>(`/products${params}`);
};

export const fetchProduct = (slug: string): Promise<ProductWithCategory> => {
  return apiFetch<ProductWithCategory>(`/products/${slug}`);
};
