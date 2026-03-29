import { Box, Container, Divider, Grid, Link, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router";

const INFO_LINKS = [
  { label: "Termékek", to: "/termekek" },
  { label: "Szállítás és fizetés", to: "/szallitas" },
  { label: "ÁSZF", to: "/aszf" },
  { label: "Adatvédelem", to: "/adatvedelem" },
];

export const Footer = () => {
  return (
    <Box component="footer" sx={{ bgcolor: "primary.light", mt: 4, py: 6 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="h6" sx={{ fontFamily: "'Lora', serif", fontWeight: 700 }}>
              Herbal Shop
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Természetes kenőcsök, kézzel készítve, prémium gyógynövényes összetevőkből.
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Információk
            </Typography>
            {INFO_LINKS.map((linkItem) => (
              <Typography key={linkItem.label} variant="body2" sx={{ mb: 0.5 }}>
                <Link component={RouterLink} to={linkItem.to} color="inherit" underline="hover">
                  {linkItem.label}
                </Link>
              </Typography>
            ))}
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Kapcsolat
            </Typography>
            <Typography variant="body2" color="text.secondary">
              info@herbalshop.hu
            </Typography>
            <Typography variant="body2" color="text.secondary">
              +36 30 123 4567
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="body2" color="text.secondary" align="center">
          © 2026 Herbal Shop — Természetes kenőcsök, kézzel készítve
        </Typography>
      </Container>
    </Box>
  );
};
