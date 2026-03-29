import { Box, Divider, Drawer, List, ListItemButton, Typography } from "@mui/material";
import { Link } from "react-router";

type Props = {
  onClose: () => void;
  open: boolean;
};

export const MobileNavDrawer = ({ onClose, open }: Props) => {
  return (
    <Drawer anchor="left" onClose={onClose} open={open}>
      <Box sx={{ width: 250 }}>
        <Box sx={{ p: 2 }}>
          <Typography color="primary.main" sx={{ fontFamily: "'Lora', serif", fontWeight: 700 }} variant="h6">
            Herbal Shop
          </Typography>
        </Box>
        <Divider />
        <List>
          <ListItemButton component={Link} onClick={onClose} to="/termekek">
            Termékek
          </ListItemButton>
          <ListItemButton component={Link} onClick={onClose} to="/kosar">
            Kosár
          </ListItemButton>
        </List>
        <Divider />
        <Box sx={{ p: 2 }}>
          <Typography color="text.secondary" variant="body2">
            info@herbalshop.hu
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};
