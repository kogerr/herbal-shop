import { useQuery } from "@tanstack/react-query";
import { fetchProduct, fetchProducts } from "../api/products";

export const useProducts = (category?: string) => {
  return useQuery({
    queryFn: () => fetchProducts(category),
    queryKey: ["products", category],
  });
};

export const useProduct = (slug: string) => {
  return useQuery({
    queryFn: () => fetchProduct(slug),
    queryKey: ["product", slug],
  });
};
