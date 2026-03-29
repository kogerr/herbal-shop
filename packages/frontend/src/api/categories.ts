import type { Category } from "@webshop/shared";
import { apiFetch } from "./client";

export const fetchCategories = (): Promise<Category[]> => {
  return apiFetch<Category[]>("/categories");
};
