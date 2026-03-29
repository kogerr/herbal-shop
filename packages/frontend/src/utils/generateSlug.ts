const ACCENT_MAP: Record<string, string> = {
  á: "a",
  é: "e",
  í: "i",
  ó: "o",
  ö: "o",
  ő: "o",
  ú: "u",
  ü: "u",
  ű: "u",
  Á: "A",
  É: "E",
  Í: "I",
  Ó: "O",
  Ö: "O",
  Ő: "O",
  Ú: "U",
  Ü: "U",
  Ű: "U",
};

export const generateSlug = (name: string): string => {
  return name
    .split("")
    .map((character) => ACCENT_MAP[character] ?? character)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
};
