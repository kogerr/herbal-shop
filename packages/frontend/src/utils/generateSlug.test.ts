import { describe, expect, it } from "vitest";
import { generateSlug } from "./generateSlug";

describe("generateSlug", () => {
  it("creates slug for Levendulás nyugtató kenőcs", () => {
    expect(generateSlug("Levendulás nyugtató kenőcs")).toBe("levendulas-nyugtato-kenocs");
  });

  it("creates slug for Ördögcsáklya ízületi balzsam", () => {
    expect(generateSlug("Ördögcsáklya ízületi balzsam")).toBe("ordogcsaklya-izuleti-balzsam");
  });

  it("creates slug for Mentás hűsítő balzsam", () => {
    expect(generateSlug("Mentás hűsítő balzsam")).toBe("mentas-husito-balzsam");
  });

  it("normalizes extra spaces", () => {
    expect(generateSlug("  Extra   spaces  ")).toBe("extra-spaces");
  });

  it("normalizes uppercase accented input", () => {
    expect(generateSlug("NAGYBETŰS NÉV")).toBe("nagybetus-nev");
  });

  it("handles all accented Hungarian characters", () => {
    expect(generateSlug("áéíóöőúüű ÁÉÍÓÖŐÚÜŰ")).toBe("aeiooouuu-aeiooouuu");
  });

  it("does not produce bad hyphens", () => {
    const slug = generateSlug("---árvíztűrő   tükörfúrógép---");

    expect(slug).toBe("arvizturo-tukorfurogep");
    expect(slug).not.toMatch(/--/);
    expect(slug).not.toMatch(/^-|-$|^$/);
  });
});
