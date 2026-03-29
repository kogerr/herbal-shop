import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAdminOrder, fetchAdminOrders, shipAdminOrder } from "../api/admin";

export const useAdminOrders = (status?: string, page?: number) => {
  return useQuery({
    queryFn: () => fetchAdminOrders({ page, status }),
    queryKey: ["admin", "orders", { page, status }],
    staleTime: 30 * 1000,
  });
};

export const useAdminOrder = (id: string) => {
  return useQuery({
    queryFn: () => fetchAdminOrder(id),
    queryKey: ["admin", "orders", id],
    staleTime: 30 * 1000,
  });
};

export const useShipOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => shipAdminOrder(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
  });
};
