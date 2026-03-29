import { Chip, Stack } from "@mui/material";
import type { Category } from "@webshop/shared";

type Props = {
  categories: Category[];
  onCategoryChange: (slug: string | null) => void;
  selectedCategory: string | null;
};

export const CategoryFilter = ({ categories, onCategoryChange, selectedCategory }: Props) => {
  return (
    <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
      <Chip
        color="primary"
        label="Mind"
        onClick={() => {
          onCategoryChange(null);
        }}
        variant={selectedCategory === null ? "filled" : "outlined"}
      />
      {categories.map((category) => (
        <Chip
          key={category.id}
          color="primary"
          label={category.name}
          onClick={() => {
            onCategoryChange(category.slug);
          }}
          variant={selectedCategory === category.slug ? "filled" : "outlined"}
        />
      ))}
    </Stack>
  );
};
