import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "../api/categories";

export const useCategories = () => {
  return useQuery({
    queryFn: fetchCategories,
    queryKey: ["categories"],
    staleTime: 5 * 60 * 1000,
  });
};
