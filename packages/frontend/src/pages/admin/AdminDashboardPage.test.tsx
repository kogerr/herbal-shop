import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { AdminDashboardPage } from "./AdminDashboardPage";

vi.mock("../../hooks/useAdminOrders", () => ({
  useAdminOrders: () => ({
    data: { orders: [], total: 0, page: 1, totalPages: 0 },
    isLoading: false,
  }),
}));

vi.mock("../../hooks/useAdminProducts", () => ({
  useAdminProducts: () => ({
    data: [
      { id: "1", name: "Product 1", isActive: true },
      { id: "2", name: "Product 2", isActive: true },
      { id: "3", name: "Product 3", isActive: false },
    ],
    isLoading: false,
  }),
}));

vi.mock("../../api/admin", () => ({
  fetchAdminStats: vi.fn().mockResolvedValue({
    activeProducts: 2,
    pendingOrders: 0,
    todayRevenue: 0,
    totalOrders: 0,
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

describe("AdminDashboardPage", () => {
  it("renders dashboard heading", () => {
    renderWithProviders(<AdminDashboardPage />);
    expect(screen.getByRole("heading", { name: /Irányítópult/i })).toBeInTheDocument();
  });

  it("renders stat cards", () => {
    renderWithProviders(<AdminDashboardPage />);
    expect(screen.getByText("Összes megrendelés")).toBeInTheDocument();
    expect(screen.getByText("Függőben lévő")).toBeInTheDocument();
    expect(screen.getByText("Mai bevétel")).toBeInTheDocument();
    expect(screen.getByText("Aktív termékek")).toBeInTheDocument();
  });

  it("renders quick action buttons", () => {
    renderWithProviders(<AdminDashboardPage />);
    expect(screen.getByRole("link", { name: /Termékek kezelése/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Összes megrendelés/i })).toBeInTheDocument();
  });
});
