import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { CheckoutPage } from "./CheckoutPage";

const mockProduct = {
  id: "1", name: "Levendulás kenőcs", priceHuf: 3490, slug: "levendulas",
  images: [], stock: 10, isActive: true, description: "", ingredients: "",
  categoryId: "c1", weight: 50, createdAt: "", updatedAt: "",
};

vi.mock("../stores/cartStore", () => ({
  useCartStore: (selector?: (state: unknown) => unknown) => {
    const state = {
      items: [{ product: mockProduct, quantity: 1 }],
      subtotal: 3490,
      totalItems: 1,
      clearCart: vi.fn(),
    };
    return selector ? selector(state) : state;
  },
}));

const renderWithProviders = (component: React.ReactNode) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{component}</MemoryRouter>
    </QueryClientProvider>,
  );
};

describe("CheckoutPage", () => {
  it("renders form section headings", () => {
    renderWithProviders(<CheckoutPage />);
    expect(screen.getByText("Kapcsolattartási adatok")).toBeInTheDocument();
    expect(screen.getByText("Szállítási cím")).toBeInTheDocument();
    expect(screen.getByText("Számlázási cím")).toBeInTheDocument();
    expect(screen.getByText("Szállítási mód")).toBeInTheDocument();
  });

  it("renders billing address checkbox", () => {
    renderWithProviders(<CheckoutPage />);
    expect(screen.getByLabelText(/Megegyezik a szállítási címmel/i)).toBeInTheDocument();
  });

  it("renders shipping method options", () => {
    renderWithProviders(<CheckoutPage />);
    expect(screen.getByText("GLS futárszolgálat")).toBeInTheDocument();
    expect(screen.getByText("Foxpost csomagpont")).toBeInTheDocument();
  });

  it("renders order summary sidebar", () => {
    renderWithProviders(<CheckoutPage />);
    expect(screen.getByText("Rendelés összegzése")).toBeInTheDocument();
    expect(screen.getByText("Részösszeg")).toBeInTheDocument();
    expect(screen.getByText("Összesen")).toBeInTheDocument();
  });

  it("has disabled submit button initially", () => {
    renderWithProviders(<CheckoutPage />);
    expect(screen.getByTestId("placeOrderButton")).toBeDisabled();
  });
});
