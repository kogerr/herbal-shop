import { describe, expect, it } from "vitest";
import { formatDateHu } from "./formatDateHu";

describe("formatDateHu", () => {
  it("formats known ISO date in Hungarian locale", () => {
    const formattedDate = formatDateHu("2026-03-27T14:35:00.000Z");

    expect(formattedDate).toContain("2026");
    expect(formattedDate).toContain("03");
    expect(formattedDate).toContain("27");
  });
});
