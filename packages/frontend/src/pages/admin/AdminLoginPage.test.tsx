import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { AdminLoginPage } from "./AdminLoginPage";

const renderWithProviders = (component: React.ReactNode) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{component}</MemoryRouter>
    </QueryClientProvider>,
  );
};

describe("AdminLoginPage", () => {
  it("renders login heading", () => {
    renderWithProviders(<AdminLoginPage />);
    expect(screen.getByRole("heading", { name: /Admin belépés/i })).toBeInTheDocument();
  });

  it("renders API key input", () => {
    renderWithProviders(<AdminLoginPage />);
    expect(screen.getByLabelText(/API kulcs/i)).toBeInTheDocument();
  });

  it("renders login button", () => {
    renderWithProviders(<AdminLoginPage />);
    expect(screen.getByRole("button", { name: "Belépés" })).toBeInTheDocument();
  });

  it("renders back to webshop link", () => {
    renderWithProviders(<AdminLoginPage />);
    expect(screen.getByRole("link", { name: /Vissza a webshopba/i })).toBeInTheDocument();
  });
});
