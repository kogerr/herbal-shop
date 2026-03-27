import { Grid, Typography } from "@mui/material";
import { PageContainer } from "../components/layout/PageContainer";
import { ProductCard } from "../components/product/ProductCard";
import { EmptyState } from "../components/shared/EmptyState";
import { LoadingSpinner } from "../components/shared/LoadingSpinner";
import { useProducts } from "../hooks/useProducts";

export const ProductListPage = () => {
  const { data, isLoading } = useProducts();

  return (
    <PageContainer>
      <Typography variant="h3" component="h1" gutterBottom>
        Termékek
      </Typography>
      {isLoading ? (
        <LoadingSpinner />
      ) : !data?.products.length ? (
        <EmptyState message="Nem található termék" />
      ) : (
        <Grid container spacing={3}>
          {data.products.map((product) => (
            <Grid key={product.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      )}
    </PageContainer>
  );
};
