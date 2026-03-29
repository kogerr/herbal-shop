import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import type { Product } from "@webshop/shared";
import { useNavigate } from "react-router";
import { useCartStore } from "../../stores/cartStore";
import { PriceDisplay } from "./PriceDisplay";

type Props = {
  product: Product;
};

export const ProductCard = ({ product }: Props) => {
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);

  const handleClick = () => {
    navigate(`/termekek/${product.slug}`);
  };

  const handleAddToCart = (event: React.MouseEvent) => {
    event.stopPropagation();
    addItem(product, 1);
  };

  return (
    <Card
      data-test-id="productCard"
            sx={{ cursor: "pointer", display: "flex", flexDirection: "column", height: "100%" }}
      onClick={handleClick}
    >
      <Box sx={{ bgcolor: "grey.200", height: 200, width: "100%" }} />
      <CardContent sx={{ display: "flex", flex: 1, flexDirection: "column" }}>
        <Typography variant="h6" gutterBottom>
          {product.name}
        </Typography>
        <PriceDisplay amount={product.priceHuf} />
        <Box sx={{ mt: "auto", pt: 2 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={handleAddToCart}
            data-test-id="addToCartButton"
                      >
            Kosárba
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};
