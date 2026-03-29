import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { AdminProductListPage } from "./AdminProductListPage";

const mockProducts = [
  { id: "p1", name: "Levendulás kenőcs", slug: "levendulas", priceHuf: 3490, stock: 10, isActive: true, images: [], description: "", ingredients: "", categoryId: "c1", weight: 50, createdAt: "", updatedAt: "" },
  { id: "p2", name: "Mentás balzsam", slug: "mentas", priceHuf: 2990, stock: 3, isActive: true, images: [], description: "", ingredients: "", categoryId: "c1", weight: 30, createdAt: "", updatedAt: "" },
  { id: "p3", name: "Inaktív termék", slug: "inaktiv", priceHuf: 1990, stock: 0, isActive: false, images: [], description: "", ingredients: "", categoryId: "c2", weight: 25, createdAt: "", updatedAt: "" },
];

vi.mock("../../hooks/useAdminProducts", () => ({
  useAdminProducts: () => ({ data: mockProducts, isLoading: false }),
  useUpdateProduct: () => ({ mutate: vi.fn() }),
}));

const renderPage = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter><AdminProductListPage /></MemoryRouter>
    </QueryClientProvider>,
  );
};

describe("AdminProductListPage", () => {
  it("renders page heading", () => {
    renderPage();
    expect(screen.getByRole("heading", { name: "Termékek" })).toBeInTheDocument();
  });

  it("renders 'Új termék' button", () => {
    renderPage();
    expect(screen.getByRole("link", { name: /Új termék/i })).toBeInTheDocument();
  });

  it("renders product table with rows", () => {
    renderPage();
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("Levendulás kenőcs")).toBeInTheDocument();
    expect(screen.getByText("Mentás balzsam")).toBeInTheDocument();
    expect(screen.getByText("Inaktív termék")).toBeInTheDocument();
  });

  it("shows active/inactive chips", () => {
    renderPage();
    const activeChips = screen.getAllByText("Aktív");
    const inactiveChips = screen.getAllByText("Inaktív");
    expect(activeChips.length).toBe(2);
    expect(inactiveChips.length).toBe(1);
  });

  it("renders edit and visibility toggle buttons for each product", () => {
    renderPage();
    expect(screen.getAllByLabelText("Szerkesztés")).toHaveLength(3);
    expect(screen.getAllByLabelText(/Deaktiválás|Aktiválás/)).toHaveLength(3);
  });
});
