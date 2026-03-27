import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { AppBar, Badge, Box, Button, IconButton, Toolbar, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router";
import { useCartStore } from "../../stores/cartStore";

export const Header = () => {
  const totalItems = useCartStore((state) => state.totalItems);
  const navigate = useNavigate();

  const handleCartClick = () => {
    navigate("/kosar");
  };

  return (
    <AppBar position="sticky">
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{ color: "primary.main", fontFamily: "'Lora', serif", fontWeight: 700, textDecoration: "none" }}
        >
          Herbal Shop
        </Typography>
        <Box sx={{ alignItems: "center", display: "flex", gap: 2 }}>
          <Button component={Link} to="/termekek" color="primary">
            Termékek
          </Button>
          <IconButton aria-label="Kosár" onClick={handleCartClick} data-test-id="cartBadge">
            <Badge badgeContent={totalItems} color="secondary">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
