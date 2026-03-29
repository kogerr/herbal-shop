import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { HomePage } from "./HomePage";

vi.mock("../hooks/useProducts", () => ({
  useProducts: () => ({
    data: {
      products: [
        { id: "1", name: "Levendulás kenőcs", priceHuf: 3490, slug: "levendulas", images: [], stock: 10, isActive: true, description: "", ingredients: "", categoryId: "c1", weight: 50, createdAt: "", updatedAt: "" },
        { id: "2", name: "Mentás balzsam", priceHuf: 2990, slug: "mentas", images: [], stock: 10, isActive: true, description: "", ingredients: "", categoryId: "c1", weight: 30, createdAt: "", updatedAt: "" },
        { id: "3", name: "Körömvirág krém", priceHuf: 4290, slug: "koromvirag", images: [], stock: 10, isActive: true, description: "", ingredients: "", categoryId: "c2", weight: 50, createdAt: "", updatedAt: "" },
        { id: "4", name: "Teafa kenőcs", priceHuf: 3690, slug: "teafa", images: [], stock: 10, isActive: true, description: "", ingredients: "", categoryId: "c2", weight: 30, createdAt: "", updatedAt: "" },
      ],
      total: 4,
      page: 1,
      totalPages: 1,
    },
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

describe("HomePage", () => {
  it("renders hero section with heading and CTA", () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByRole("heading", { name: /természetes kenőcsök/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Termékek megtekintése" })).toBeInTheDocument();
  });

  it("renders brand story section", () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText(/történetünk/i)).toBeInTheDocument();
  });

  it("renders trust signals", () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText("100% természetes")).toBeInTheDocument();
    expect(screen.getByText("Kézzel készített")).toBeInTheDocument();
    expect(screen.getByText("Magyar termék")).toBeInTheDocument();
  });

  it("renders featured products", () => {
    renderWithProviders(<HomePage />);
    expect(screen.getAllByTestId("productCard")).toHaveLength(4);
  });

  it("renders 'Összes termék' link", () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText(/Összes termék/i)).toBeInTheDocument();
  });
});
