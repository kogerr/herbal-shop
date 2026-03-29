import MenuIcon from "@mui/icons-material/Menu";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { AppBar, Badge, Box, Button, IconButton, Toolbar, Typography } from "@mui/material";
import { useState } from "react";
import { Link } from "react-router";
import { useCartStore } from "../../stores/cartStore";
import { CartDrawer } from "./CartDrawer";
import { MobileNavDrawer } from "./MobileNavDrawer";

export const Header = () => {
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const totalItems = useCartStore((state) => state.totalItems);

  const handleCartClick = () => {
    setCartDrawerOpen(true);
  };

  const handleMobileNavOpen = () => {
    setMobileNavOpen(true);
  };

  return (
    <>
      <AppBar position="sticky">
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ alignItems: "center", display: "flex", gap: 1 }}>
            <IconButton aria-label="Menü" onClick={handleMobileNavOpen} sx={{ display: { md: "none", xs: "flex" } }}>
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{ color: "primary.main", fontFamily: "'Lora', serif", fontWeight: 700, textDecoration: "none" }}
            >
              Herbal Shop
            </Typography>
          </Box>
          <Box sx={{ alignItems: "center", display: "flex", gap: 2 }}>
            <Button component={Link} to="/termekek" color="primary" sx={{ display: { md: "flex", xs: "none" } }}>
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
      <CartDrawer
        open={cartDrawerOpen}
        onClose={() => {
          setCartDrawerOpen(false);
        }}
      />
      <MobileNavDrawer
        open={mobileNavOpen}
        onClose={() => {
          setMobileNavOpen(false);
        }}
      />
    </>
  );
};
