import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { AdminOrderDetailPage } from "./AdminOrderDetailPage";

const mockOrder = {
  id: "o1",
  orderNumber: "HO-20260327-001",
  status: "paid" as const,
  customerName: "Kiss Anna",
  customerEmail: "kiss@test.com",
  customerPhone: "+36301234567",
  shippingName: "Kiss Anna",
  shippingZip: "1234",
  shippingCity: "Budapest",
  shippingAddress: "Fő utca 1.",
  billingName: "Kiss Anna",
  billingZip: "1234",
  billingCity: "Budapest",
  billingAddress: "Fő utca 1.",
  billingTaxNumber: null,
  shippingCostHuf: 1490,
  subtotalHuf: 6980,
  totalHuf: 8470,
  note: "Kérem csengessen",
  createdAt: "2026-03-27T10:00:00Z",
  updatedAt: "2026-03-27T10:00:00Z",
  items: [
    { id: "i1", productName: "Levendulás kenőcs", productPriceHuf: 3490, quantity: 2, lineTotalHuf: 6980 },
  ],
};

vi.mock("../../hooks/useAdminOrders", () => ({
  useAdminOrder: () => ({ data: mockOrder, isLoading: false }),
  useShipOrder: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

const renderPage = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/admin/megrendelesek/o1"]}>
        <Routes>
          <Route path="/admin/megrendelesek/:id" element={<AdminOrderDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe("AdminOrderDetailPage", () => {
  it("renders order number in heading", () => {
    renderPage();
    expect(screen.getByText(/HO-20260327-001/)).toBeInTheDocument();
  });

  it("renders back button", () => {
    renderPage();
    expect(screen.getByRole("button", { name: /Vissza/i })).toBeInTheDocument();
  });

  it("renders ship button when status is paid", () => {
    renderPage();
    expect(screen.getByRole("button", { name: /Szállítás indítása/i })).toBeInTheDocument();
  });

  it("renders order items table", () => {
    renderPage();
    expect(screen.getByText("Levendulás kenőcs")).toBeInTheDocument();
    expect(screen.getByText("Részösszeg:")).toBeInTheDocument();
    expect(screen.getByText("Összesen:")).toBeInTheDocument();
  });

  it("renders customer info card", () => {
    renderPage();
    expect(screen.getByText("Vevő adatai")).toBeInTheDocument();
    expect(screen.getByText("Kiss Anna")).toBeInTheDocument();
    expect(screen.getByText("kiss@test.com")).toBeInTheDocument();
  });

  it("renders shipping and billing address cards", () => {
    renderPage();
    expect(screen.getByText("Szállítási cím")).toBeInTheDocument();
    expect(screen.getByText("Számlázási cím")).toBeInTheDocument();
  });

  it("renders order note", () => {
    renderPage();
    expect(screen.getByText("Kérem csengessen")).toBeInTheDocument();
  });

  it("renders status timestamps", () => {
    renderPage();
    expect(screen.getByText(/Létrehozva:/)).toBeInTheDocument();
    expect(screen.getByText(/Frissítve:/)).toBeInTheDocument();
  });
});
