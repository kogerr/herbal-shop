import { Box, Button, Grid, Typography } from "@mui/material";
import { useState } from "react";
import { useParams } from "react-router";
import { PageContainer } from "../components/layout/PageContainer";
import { PriceDisplay } from "../components/product/PriceDisplay";
import { QuantitySelector } from "../components/product/QuantitySelector";
import { LoadingSpinner } from "../components/shared/LoadingSpinner";
import { useProduct } from "../hooks/useProducts";
import { useCartStore } from "../stores/cartStore";

export const ProductDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useProduct(slug ?? "");
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!slug || !product) {
    return (
      <PageContainer>
        <Typography>A termék nem található.</Typography>
      </PageContainer>
    );
  }

  const handleAddToCart = () => {
    addItem(product, quantity);
  };

  return (
    <PageContainer>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ bgcolor: "grey.200", borderRadius: 2, height: 400, width: "100%" }} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            {product.name}
          </Typography>
          <PriceDisplay amount={product.priceHuf} variant="h4" />
          <Typography sx={{ mt: 2 }}>{product.description}</Typography>
          <Typography variant="h6" sx={{ mt: 3 }}>
            Összetevők
          </Typography>
          <Typography color="text.secondary">{product.ingredients}</Typography>
          <Box sx={{ alignItems: "center", display: "flex", gap: 2, mt: 4 }}>
            <QuantitySelector value={quantity} onChange={setQuantity} />
            <Button variant="contained" size="large" onClick={handleAddToCart} data-test-id="addToCartButton">
              Kosárba
            </Button>
          </Box>
        </Grid>
      </Grid>
    </PageContainer>
  );
};
