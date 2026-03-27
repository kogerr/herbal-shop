import { Box, Button, Container, Grid, Typography } from "@mui/material";
import { Link } from "react-router";
import { ProductCard } from "../components/product/ProductCard";
import { LoadingSpinner } from "../components/shared/LoadingSpinner";
import { useProducts } from "../hooks/useProducts";

export const HomePage = () => {
  const { data, isLoading } = useProducts();

  return (
    <Box>
      <Box sx={{ bgcolor: "primary.light", py: { md: 12, xs: 6 } }}>
        <Container maxWidth="lg">
          <Typography variant="h2" component="h1" gutterBottom>
            Természetes kenőcsök, kézzel készítve
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
            Prémium minőségű gyógynövényes termékek, természetes összetevőkkel
          </Typography>
          <Button variant="contained" size="large" component={Link} to="/termekek">
            Termékek megtekintése
          </Button>
        </Container>
      </Box>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h4" gutterBottom>
          Kiemelt termékek
        </Typography>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <Grid container spacing={3}>
            {data?.products.slice(0, 4).map((product) => (
              <Grid key={product.id} size={{ xs: 12, sm: 6, md: 3 }}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};
