import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { CartPage } from "./CartPage";

const mockProduct = {
  id: "1", name: "Levendulás kenőcs", priceHuf: 3490, slug: "levendulas",
  images: [], stock: 10, isActive: true, description: "", ingredients: "",
  categoryId: "c1", weight: 50, createdAt: "", updatedAt: "",
};

vi.mock("../stores/cartStore", () => ({
  useCartStore: (selector?: (state: unknown) => unknown) => {
    const state = {
      items: [{ product: mockProduct, quantity: 2 }],
      subtotal: 6980,
      totalItems: 2,
      removeItem: vi.fn(),
      updateQuantity: vi.fn(),
    };
    return selector ? selector(state) : state;
  },
}));

const renderWithProviders = (component: React.ReactNode) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

describe("CartPage", () => {
  it("shows shipping threshold alert", () => {
    renderWithProviders(<CartPage />);
    expect(screen.getByText(/szállítás.*15.*000/i)).toBeInTheDocument();
  });

  it("shows summary with subtotal, shipping cost, and total", () => {
    renderWithProviders(<CartPage />);
    expect(screen.getByText("Részösszeg")).toBeInTheDocument();
    expect(screen.getByText(/Szállítási költség/i)).toBeInTheDocument();
    expect(screen.getByText("Összesen")).toBeInTheDocument();
  });

  it("shows checkout button", () => {
    renderWithProviders(<CartPage />);
    expect(screen.getByRole("button", { name: "Tovább a fizetéshez" })).toBeInTheDocument();
  });
});
