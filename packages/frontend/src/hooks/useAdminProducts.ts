import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createAdminProduct, deleteAdminProduct, fetchAdminProducts, updateAdminProduct } from "../api/admin";

export const useAdminProducts = () => {
  return useQuery({
    queryFn: fetchAdminProducts,
    queryKey: ["admin", "products"],
    staleTime: 30 * 1000,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAdminProduct,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ body, id }: { body: Partial<import("@webshop/shared").Product>; id: string }) => updateAdminProduct(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAdminProduct(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
};
