import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import WarningIcon from "@mui/icons-material/Warning";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Grid,
  Link as MuiLink,
  Skeleton,
  Snackbar,
  Typography,
} from "@mui/material";
import { type SyntheticEvent, useState } from "react";
import { Link, useParams } from "react-router";
import { PageContainer } from "../components/layout/PageContainer";
import { PriceDisplay } from "../components/product/PriceDisplay";
import { QuantitySelector } from "../components/product/QuantitySelector";
import { useProduct } from "../hooks/useProducts";
import { useCartStore } from "../stores/cartStore";

export const ProductDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useProduct(slug ?? "");
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);
  const [showAdded, setShowAdded] = useState(false);

  if (isLoading) {
    return (
      <PageContainer>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton variant="rounded" height={400} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton variant="text" width="70%" height={56} />
            <Skeleton variant="text" width="30%" height={48} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="rounded" width={220} height={48} sx={{ mt: 4 }} />
          </Grid>
        </Grid>
      </PageContainer>
    );
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
    setShowAdded(true);
  };

  const handleCloseSnackbar = (_event?: Event | SyntheticEvent, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }

    setShowAdded(false);
  };

  return (
    <PageContainer>
      <Breadcrumbs sx={{ mb: 3 }}>
        <MuiLink component={Link} to="/" underline="hover" color="inherit">
          Főoldal
        </MuiLink>
        <MuiLink component={Link} to="/termekek" underline="hover" color="inherit">
          Termékek
        </MuiLink>
        <Typography color="text.primary">{product.name}</Typography>
      </Breadcrumbs>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          {product.images.length > 0 ? (
            <Box
              component="img"
              src={product.images[0]}
              alt={product.name}
              sx={{ borderRadius: 2, height: 400, objectFit: "cover", width: "100%" }}
            />
          ) : (
            <Box
              sx={{
                alignItems: "center",
                bgcolor: "grey.200",
                borderRadius: 2,
                color: "text.secondary",
                display: "flex",
                height: 400,
                justifyContent: "center",
                width: "100%",
              }}
            >
              <ImageOutlinedIcon sx={{ fontSize: 96 }} />
            </Box>
          )}
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            {product.name}
          </Typography>
          <PriceDisplay amount={product.priceHuf} variant="h4" />
          <Box sx={{ mt: 1 }}>
            {product.stock > 5 && (
              <Chip icon={<CheckCircleIcon />} label="Készleten" color="success" size="small" variant="outlined" />
            )}
            {product.stock > 0 && product.stock <= 5 && (
              <Chip
                icon={<WarningIcon />}
                label={`Csak ${product.stock} db maradt`}
                color="warning"
                size="small"
                variant="outlined"
              />
            )}
            {product.stock === 0 && (
              <Chip icon={<CancelIcon />} label="Elfogyott" color="error" size="small" variant="outlined" />
            )}
          </Box>
          <Typography sx={{ mt: 2 }}>{product.description}</Typography>
          <Typography variant="h6" sx={{ mt: 3 }}>
            Összetevők
          </Typography>
          <Typography color="text.secondary">{product.ingredients}</Typography>
          <Box sx={{ alignItems: "center", display: "flex", gap: 2, mt: 4 }}>
            <QuantitySelector value={quantity} onChange={setQuantity} max={product.stock} />
            <Button
              variant="contained"
              size="large"
              onClick={handleAddToCart}
              data-test-id="addToCartButton"
              disabled={product.stock === 0}
              startIcon={<ShoppingCartIcon />}
            >
              Kosárba
            </Button>
          </Box>
        </Grid>
      </Grid>
      <Snackbar open={showAdded} autoHideDuration={3000} onClose={handleCloseSnackbar}>
        <Alert severity="success" variant="filled" onClose={handleCloseSnackbar} sx={{ width: "100%" }}>
          Termék hozzáadva a kosárhoz!
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};
