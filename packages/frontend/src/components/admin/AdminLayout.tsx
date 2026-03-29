import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";
import MenuIcon from "@mui/icons-material/Menu";
import ReceiptIcon from "@mui/icons-material/Receipt";
import LogoutIcon from "@mui/icons-material/Logout";
import StorefrontIcon from "@mui/icons-material/Storefront";
import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import type { ReactNode } from "react";
import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";

const drawerWidth = 240;

type AdminNavItem = {
  icon: ReactNode;
  label: string;
  to: string;
};

const adminNavItems: AdminNavItem[] = [
  { icon: <DashboardIcon />, label: "Irányítópult", to: "/admin" },
  { icon: <InventoryIcon />, label: "Termékek", to: "/admin/termekek" },
  { icon: <ReceiptIcon />, label: "Megrendelések", to: "/admin/megrendelesek" },
];

export const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen((previousValue) => !previousValue);
  };

  const handleDrawerClose = () => {
    setMobileOpen(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin-api-key");
    navigate("/admin/login");
  };

  const isItemSelected = (to: string) => {
    if (to === "/admin") {
      return location.pathname === "/admin";
    }

    return location.pathname.startsWith(to);
  };

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Toolbar>
        <Typography variant="h6">Herbal Admin</Typography>
      </Toolbar>
      <Divider />
      <List sx={{ flexGrow: 1 }}>
        {adminNavItems.map((item) => {
          const selected = isItemSelected(item.to);

          return (
            <ListItem disablePadding key={item.to}>
              <ListItemButton
                component={Link}
                onClick={handleDrawerClose}
                selected={selected}
                sx={{
                  ...(selected
                    ? {
                        bgcolor: "primary.light",
                        color: "primary.main",
                        "& .MuiListItemIcon-root": {
                          color: "primary.main",
                        },
                      }
                    : {}),
                }}
                to={item.to}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          );
        })}
        <Divider sx={{ my: 1 }} />
        <ListItem disablePadding>
          <ListItemButton component={Link} onClick={handleDrawerClose} to="/">
            <ListItemIcon>
              <StorefrontIcon />
            </ListItemIcon>
            <ListItemText primary="Webshop megtekintése" />
          </ListItemButton>
        </ListItem>
      </List>
      <Box sx={{ p: 2 }}>
        <Button color="error" fullWidth onClick={handleLogout} startIcon={<LogoutIcon />} variant="outlined">
          Kijelentkezés
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{
          ml: { md: `${drawerWidth}px` },
          width: { md: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ display: { md: "none" }, mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography noWrap variant="h6">
            Admin felület
          </Typography>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ flexShrink: { md: 0 }, width: { md: drawerWidth } }}>
        <Drawer
          open
          sx={{
            display: { md: "block", xs: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
          variant="permanent"
        >
          {drawerContent}
        </Drawer>
        <Drawer
          ModalProps={{ keepMounted: true }}
          onClose={handleDrawerClose}
          open={mobileOpen}
          sx={{
            display: { md: "none", xs: "block" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
          variant="temporary"
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};
