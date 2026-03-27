import { Box, Button, Grid, TextField, Typography } from "@mui/material";
import { PageContainer } from "../components/layout/PageContainer";

export const CheckoutPage = () => {
  return (
    <PageContainer>
      <Typography variant="h3" component="h1" gutterBottom>
        Fizetés
      </Typography>
      <Grid container spacing={3} data-test-id="checkoutForm">
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="Név" required />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="E-mail" type="email" required />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="Telefon" required />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="Irányítószám" required />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="Város" required />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth label="Cím" required />
        </Grid>
        <Grid size={12}>
          <TextField fullWidth label="Megjegyzés" multiline rows={3} />
        </Grid>
        <Grid size={12}>
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button variant="contained" size="large" disabled data-test-id="placeOrderButton">
              Megrendelés elküldése
            </Button>
          </Box>
        </Grid>
      </Grid>
    </PageContainer>
  );
};
