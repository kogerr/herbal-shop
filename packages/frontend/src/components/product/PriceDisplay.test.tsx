import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PriceDisplay } from "./PriceDisplay";

describe("PriceDisplay", () => {
  it("renders formatted HUF price", () => {
    render(<PriceDisplay amount={3490} />);
    expect(screen.getByText(/3[\s\u00a0.]?490\s*Ft/)).toBeInTheDocument();
  });
});
