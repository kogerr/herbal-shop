import SearchOffIcon from "@mui/icons-material/SearchOff";
import { Box, Grid, MenuItem, TextField, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { CategoryFilter } from "../components/product/CategoryFilter";
import { ProductCard } from "../components/product/ProductCard";
import { SkeletonProductCard } from "../components/product/SkeletonProductCard";
import { PageContainer } from "../components/layout/PageContainer";
import { EmptyState } from "../components/shared/EmptyState";
import { useCategories } from "../hooks/useCategories";
import { useProducts } from "../hooks/useProducts";

export const ProductListPage = () => {
  const { data: categoriesData = [], isLoading: isCategoriesLoading } = useCategories();
  const { data, isLoading: isProductsLoading } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("name-asc");

  const sortedProducts = useMemo(() => {
    const filteredProducts = (data?.products ?? []).filter((product) => {
      if (!selectedCategory) {
        return true;
      }

      const category = categoriesData.find((categoryItem) => categoryItem.id === product.categoryId);
      return category?.slug === selectedCategory;
    });

    const productsCopy = [...filteredProducts];

    if (sortBy === "price-asc") {
      productsCopy.sort((a, b) => a.priceHuf - b.priceHuf);
      return productsCopy;
    }

    if (sortBy === "price-desc") {
      productsCopy.sort((a, b) => b.priceHuf - a.priceHuf);
      return productsCopy;
    }

    productsCopy.sort((a, b) => a.name.localeCompare(b.name, "hu"));
    return productsCopy;
  }, [categoriesData, data?.products, selectedCategory, sortBy]);

  const handleClearFilters = () => {
    setSelectedCategory(null);
    setSortBy("name-asc");
  };

  const isLoading = isCategoriesLoading || isProductsLoading;

  return (
    <PageContainer>
      <Typography variant="h3" component="h1" gutterBottom>
        Termékek
      </Typography>

      <Box
        sx={{
          alignItems: { md: "center", xs: "stretch" },
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <CategoryFilter
          categories={categoriesData}
          onCategoryChange={setSelectedCategory}
          selectedCategory={selectedCategory}
        />

        <TextField
          select
          size="small"
          label="Rendezés"
          value={sortBy}
          onChange={(event) => {
            setSortBy(event.target.value);
          }}
          sx={{ minWidth: { md: 220, xs: "100%" } }}
        >
          <MenuItem value="name-asc">Név (A-Z)</MenuItem>
          <MenuItem value="price-asc">Ár (növekvő)</MenuItem>
          <MenuItem value="price-desc">Ár (csökkenő)</MenuItem>
        </TextField>
      </Box>

      {isLoading ? (
        <Grid container spacing={3}>
          {Array.from({ length: 8 }).map((_, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <SkeletonProductCard />
            </Grid>
          ))}
        </Grid>
      ) : !sortedProducts.length ? (
        <EmptyState
          icon={<SearchOffIcon fontSize="inherit" />}
          message="Nem található termék"
          action={{
            label: "Szűrők törlése",
            onClick: handleClearFilters,
          }}
        />
      ) : (
        <Grid container spacing={3}>
          {sortedProducts.map((product) => (
            <Grid key={product.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      )}
    </PageContainer>
  );
};
