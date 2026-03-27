import { Box, Button, Typography } from "@mui/material";
import { Link } from "react-router";
import { PageContainer } from "../components/layout/PageContainer";

export const OrderConfirmationPage = () => {
  return (
    <PageContainer>
      <Box sx={{ textAlign: "center", py: 4 }} data-test-id="orderConfirmation">
        <Typography variant="h3" component="h1" gutterBottom>
          Köszönjük a rendelését!
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          A rendelés részleteiről e-mailben értesítjük.
        </Typography>
        <Button variant="contained" component={Link} to="/termekek">
          Tovább vásárolok
        </Button>
      </Box>
    </PageContainer>
  );
};
