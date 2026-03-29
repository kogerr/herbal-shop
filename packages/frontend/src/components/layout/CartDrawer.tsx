import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { Link } from "react-router";
import { useCartStore } from "../../stores/cartStore";
import { PriceDisplay } from "../product/PriceDisplay";
import { QuantitySelector } from "../product/QuantitySelector";
import { EmptyState } from "../shared/EmptyState";

type Props = {
  onClose: () => void;
  open: boolean;
};

export const CartDrawer = ({ onClose, open }: Props) => {
  const { items, removeItem, subtotal, totalItems, updateQuantity } = useCartStore((state) => ({
    items: state.items,
    removeItem: state.removeItem,
    subtotal: state.subtotal,
    totalItems: state.totalItems,
    updateQuantity: state.updateQuantity,
  }));

  return (
    <Drawer anchor="right" onClose={onClose} open={open}>
      <Box
        data-test-id="cartDrawer"
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: { xs: "100vw", sm: 400 },
        }}
      >
        <Box sx={{ alignItems: "center", display: "flex", justifyContent: "space-between", p: 2 }}>
          <Typography variant="h6">Kosár ({totalItems})</Typography>
          <IconButton aria-label="Bezárás" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider />

        <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
          {items.length === 0 ? (
            <EmptyState message="A kosár üres" />
          ) : (
            <Stack divider={<Divider flexItem />} spacing={2}>
              {items.map((item) => (
                <Box key={item.product.id} sx={{ alignItems: "center", display: "flex", gap: 2 }}>
                  <Box sx={{ bgcolor: "grey.200", borderRadius: 1, flexShrink: 0, height: 60, width: 60 }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {item.product.name}
                    </Typography>
                    <PriceDisplay amount={item.product.priceHuf} variant="body2" />
                    <QuantitySelector
                      value={item.quantity}
                      onChange={(quantity) => {
                        updateQuantity(item.product.id, quantity);
                      }}
                    />
                  </Box>
                  <IconButton
                    aria-label="Törlés"
                    onClick={() => {
                      removeItem(item.product.id);
                    }}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                </Box>
              ))}
            </Stack>
          )}
        </Box>

        <Box sx={{ borderColor: "divider", borderTop: 1, p: 2 }}>
          <Box sx={{ alignItems: "center", display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography fontWeight={600}>Összesen:</Typography>
            <PriceDisplay amount={subtotal} />
          </Box>
          <Stack spacing={1.5}>
            <Button component={Link} fullWidth onClick={onClose} to="/kosar" variant="contained">
              Kosár megtekintése
            </Button>
            <Button component={Link} fullWidth onClick={onClose} to="/penztar" variant="outlined">
              Fizetés
            </Button>
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
};
