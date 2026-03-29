import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { AdminProductFormPage } from "./AdminProductFormPage";

vi.mock("../../hooks/useAdminProducts", () => ({
  useAdminProducts: () => ({ data: [], isLoading: false }),
  useCreateProduct: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateProduct: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock("../../hooks/useCategories", () => ({
  useCategories: () => ({
    data: [
      { id: "c1", name: "Fájdalomcsillapító", slug: "fajdalomcsillapito", sortOrder: 1 },
      { id: "c2", name: "Bőrápoló", slug: "borapolo", sortOrder: 2 },
    ],
    isLoading: false,
  }),
}));

const renderPage = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/admin/termekek/uj"]}>
        <AdminProductFormPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe("AdminProductFormPage", () => {
  it("renders create mode heading", () => {
    renderPage();
    expect(screen.getByRole("heading", { name: /Új termék/i })).toBeInTheDocument();
  });

  it("renders back button", () => {
    renderPage();
    expect(screen.getByRole("button", { name: /Vissza/i })).toBeInTheDocument();
  });

  it("renders all form fields", () => {
    renderPage();
    expect(screen.getByLabelText(/Név/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Slug/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Leírás/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Összetevők/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Ár/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Készlet/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Súly/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Kategória/i)).toBeInTheDocument();
  });

  it("renders cancel and save buttons", () => {
    renderPage();
    expect(screen.getByRole("button", { name: "Mégse" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mentés" })).toBeInTheDocument();
  });

  it("renders active switch", () => {
    renderPage();
    expect(screen.getByLabelText("Aktív")).toBeInTheDocument();
  });
});
