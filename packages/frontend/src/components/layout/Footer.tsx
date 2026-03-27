import { Box, Container, Typography } from "@mui/material";

export const Footer = () => {
  return (
    <Box component="footer" sx={{ bgcolor: "primary.light", mt: 4, py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          © 2026 Herbal Shop — Természetes kenőcsök, kézzel készítve
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
          Kapcsolat: info@herbalshop.hu
        </Typography>
      </Container>
    </Box>
  );
};
