import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { AdminOrderListPage } from "./AdminOrderListPage";

const mockOrders = [
  { id: "o1", orderNumber: "HO-20260327-001", customerName: "Kiss Anna", customerEmail: "kiss@test.com", customerPhone: "+36301234567", status: "paid" as const, totalHuf: 5980, createdAt: "2026-03-27T10:00:00Z" },
  { id: "o2", orderNumber: "HO-20260327-002", customerName: "Nagy Péter", customerEmail: "nagy@test.com", customerPhone: "+36309876543", status: "pending" as const, totalHuf: 3490, createdAt: "2026-03-27T11:00:00Z" },
];

vi.mock("../../hooks/useAdminOrders", () => ({
  useAdminOrders: () => ({
    data: { orders: mockOrders, total: 2, page: 1, totalPages: 1 },
    isLoading: false,
  }),
}));

const renderPage = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter><AdminOrderListPage /></MemoryRouter>
    </QueryClientProvider>,
  );
};

describe("AdminOrderListPage", () => {
  it("renders page heading", () => {
    renderPage();
    expect(screen.getByRole("heading", { name: "Megrendelések" })).toBeInTheDocument();
  });

  it("renders status filter chips", () => {
    renderPage();
    expect(screen.getByRole("button", { name: "Mind" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Függőben" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Fizetve" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Kiszállítva" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Kézbesítve" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Lemondva" })).toBeInTheDocument();
  });

  it("renders order table with data", () => {
    renderPage();
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("HO-20260327-001")).toBeInTheDocument();
    expect(screen.getByText("Kiss Anna")).toBeInTheDocument();
    expect(screen.getByText("HO-20260327-002")).toBeInTheDocument();
    expect(screen.getByText("Nagy Péter")).toBeInTheDocument();
  });

  it("renders order status chips", () => {
    renderPage();
    const table = screen.getByRole("table");
    expect(within(table).getByText("Fizetve")).toBeInTheDocument();
    expect(within(table).getByText("Függőben")).toBeInTheDocument();
  });

  it("renders pagination", () => {
    renderPage();
    expect(screen.getByText(/Sorok száma/i)).toBeInTheDocument();
  });
});
