import DeleteIcon from "@mui/icons-material/Delete";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { formatPriceHuf } from "@webshop/shared";
import { Alert, Box, Button, Divider, IconButton, Paper, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router";
import { PageContainer } from "../components/layout/PageContainer";
import { PriceDisplay } from "../components/product/PriceDisplay";
import { QuantitySelector } from "../components/product/QuantitySelector";
import { EmptyState } from "../components/shared/EmptyState";
import { useCartStore } from "../stores/cartStore";

const FREE_SHIPPING_THRESHOLD = 15_000;
const SHIPPING_COST_HUF = 1_490;

export const CartPage = () => {
  const { items, removeItem, subtotal, updateQuantity } = useCartStore();
  const navigate = useNavigate();
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST_HUF;
  const total = subtotal + shippingCost;

  if (items.length === 0) {
    return (
      <PageContainer>
        <EmptyState
          icon={<ShoppingCartIcon fontSize="inherit" />}
          message="A kosár üres"
          action={{ label: "Termékek böngészése", onClick: () => navigate("/termekek") }}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Typography variant="h3" component="h1" gutterBottom>
        Kosár
      </Typography>
      <Alert severity={subtotal >= FREE_SHIPPING_THRESHOLD ? "success" : "info"} sx={{ mb: 2 }}>
        {subtotal >= FREE_SHIPPING_THRESHOLD
          ? "Ingyenes szállítás!"
          : `Ingyenes szállítás ${formatPriceHuf(FREE_SHIPPING_THRESHOLD)} feletti rendelésnél!`}
      </Alert>
      {items.map((item) => (
        <Box key={item.product.id} data-test-id="cartLineItem">
          <Box
            sx={{
              alignItems: { sm: "center" },
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              py: 2,
            }}
          >
            <Box sx={{ alignItems: "center", display: "flex", flex: 1, gap: 2, width: "100%" }}>
              <Box sx={{ bgcolor: "grey.200", borderRadius: 1, flexShrink: 0, height: 80, width: 80 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {item.product.name}
                </Typography>
                <PriceDisplay amount={item.product.priceHuf} variant="body2" />
              </Box>
            </Box>
            <Box
              sx={{
                alignItems: "center",
                display: "flex",
                gap: 1,
                justifyContent: { xs: "space-between", sm: "flex-end" },
                width: { xs: "100%", sm: "auto" },
              }}
            >
              <QuantitySelector
                value={item.quantity}
                onChange={(value) => updateQuantity(item.product.id, value)}
              />
              <PriceDisplay amount={item.product.priceHuf * item.quantity} />
              <IconButton aria-label="Törlés" onClick={() => removeItem(item.product.id)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
          <Divider />
        </Box>
      ))}
      <Paper sx={{ mt: 3, p: 3 }}>
        <Stack spacing={1}>
          <Box sx={{ alignItems: "center", display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body1">Részösszeg</Typography>
            <PriceDisplay amount={subtotal} />
          </Box>
          <Box sx={{ alignItems: "center", display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body1">Szállítási költség</Typography>
            {shippingCost === 0 ? (
              <Typography variant="body1" color="success.main" fontWeight={600}>
                Ingyenes
              </Typography>
            ) : (
              <PriceDisplay amount={shippingCost} />
            )}
          </Box>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ alignItems: "center", display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h6">Összesen</Typography>
            <PriceDisplay amount={total} variant="h6" />
          </Box>
        </Stack>
        <Button fullWidth sx={{ mt: 3 }} variant="contained" size="large" onClick={() => navigate("/penztar")}>
          Tovább a fizetéshez
        </Button>
      </Paper>
    </PageContainer>
  );
};
