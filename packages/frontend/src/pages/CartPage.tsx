import DeleteIcon from "@mui/icons-material/Delete";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Box, Button, Divider, IconButton, Typography } from "@mui/material";
import { useNavigate } from "react-router";
import { PageContainer } from "../components/layout/PageContainer";
import { PriceDisplay } from "../components/product/PriceDisplay";
import { QuantitySelector } from "../components/product/QuantitySelector";
import { EmptyState } from "../components/shared/EmptyState";
import { useCartStore } from "../stores/cartStore";

export const CartPage = () => {
  const { items, removeItem, subtotal, updateQuantity } = useCartStore();
  const navigate = useNavigate();

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
      {items.map((item) => (
        <Box key={item.product.id} data-test-id="cartLineItem">
          <Box sx={{ alignItems: "center", display: "flex", gap: 2, py: 2 }}>
            <Box sx={{ bgcolor: "grey.200", borderRadius: 1, flexShrink: 0, height: 80, width: 80 }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                {item.product.name}
              </Typography>
              <PriceDisplay amount={item.product.priceHuf} variant="body2" />
            </Box>
            <QuantitySelector
              value={item.quantity}
              onChange={(value) => updateQuantity(item.product.id, value)}
            />
            <PriceDisplay amount={item.product.priceHuf * item.quantity} />
            <IconButton aria-label="Törlés" onClick={() => removeItem(item.product.id)}>
              <DeleteIcon />
            </IconButton>
          </Box>
          <Divider />
        </Box>
      ))}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, gap: 2, alignItems: "center" }}>
        <Typography variant="h5">Összesen:</Typography>
        <PriceDisplay amount={subtotal} variant="h5" />
      </Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Button variant="contained" size="large" onClick={() => navigate("/penztar")}>
          Tovább a fizetéshez
        </Button>
      </Box>
    </PageContainer>
  );
};
