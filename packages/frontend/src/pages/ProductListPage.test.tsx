import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { ProductListPage } from "./ProductListPage";

vi.mock("../hooks/useProducts", () => ({
  useProducts: () => ({
    data: {
      products: [
        { id: "1", name: "Levendulás kenőcs", priceHuf: 3490, slug: "levendulas", images: [], stock: 10, isActive: true, description: "", ingredients: "", categoryId: "c1", weight: 50, createdAt: "", updatedAt: "" },
        { id: "2", name: "Mentás balzsam", priceHuf: 2990, slug: "mentas", images: [], stock: 5, isActive: true, description: "", ingredients: "", categoryId: "c1", weight: 30, createdAt: "", updatedAt: "" },
      ],
      total: 2,
      page: 1,
      totalPages: 1,
    },
    isLoading: false,
  }),
}));

vi.mock("../hooks/useCategories", () => ({
  useCategories: () => ({
    data: [
      { id: "c1", name: "Fájdalomcsillapító", slug: "fajdalomcsillapito", sortOrder: 1 },
      { id: "c2", name: "Bőrápoló", slug: "borapolo", sortOrder: 2 },
    ],
    isLoading: false,
  }),
}));

const renderWithProviders = (component: React.ReactNode) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{component}</MemoryRouter>
    </QueryClientProvider>,
  );
};

describe("ProductListPage", () => {
  it("renders page heading", () => {
    renderWithProviders(<ProductListPage />);
    expect(screen.getByRole("heading", { name: "Termékek" })).toBeInTheDocument();
  });

  it("renders category filter chips", () => {
    renderWithProviders(<ProductListPage />);
    expect(screen.getByRole("button", { name: "Mind" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Fájdalomcsillapító" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Bőrápoló" })).toBeInTheDocument();
  });

  it("renders sort dropdown", () => {
    renderWithProviders(<ProductListPage />);
    expect(screen.getByLabelText("Rendezés")).toBeInTheDocument();
  });

  it("renders product cards", () => {
    renderWithProviders(<ProductListPage />);
    expect(screen.getAllByTestId("productCard")).toHaveLength(2);
  });
});
