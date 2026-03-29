import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import SpaOutlinedIcon from "@mui/icons-material/SpaOutlined";
import { Box, Button, Container, Grid, Paper, Typography } from "@mui/material";
import { Link } from "react-router";
import { ProductCard } from "../components/product/ProductCard";
import { SkeletonProductCard } from "../components/product/SkeletonProductCard";
import { useProducts } from "../hooks/useProducts";

const TRUST_SIGNALS = [
  {
    description: "Csak természetes összetevőket használunk",
    icon: SpaOutlinedIcon,
    label: "100% természetes",
  },
  {
    description: "Minden termék kézzel, kis tételben készül",
    icon: HandshakeOutlinedIcon,
    label: "Kézzel készített",
  },
  {
    description: "Büszkén készítjük Magyarországon",
    icon: FlagOutlinedIcon,
    label: "Magyar termék",
  },
];

export const HomePage = () => {
  const { data, isLoading } = useProducts();

  return (
    <Box>
      <Box sx={{ bgcolor: "primary.light", py: { md: 12, xs: 6 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <Typography variant="h2" component="h1" gutterBottom>
                Természetes kenőcsök, kézzel készítve
              </Typography>
              <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
                Prémium minőségű gyógynövényes termékek, természetes összetevőkkel
              </Typography>
              <Button variant="contained" size="large" component={Link} to="/termekek">
                Termékek megtekintése
              </Button>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }} sx={{ display: { md: "block", xs: "none" } }}>
              <Box sx={{ bgcolor: "grey.200", borderRadius: 3, height: 350, width: "100%" }} />
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h4" gutterBottom>
          Kiemelt termékek
        </Typography>
        {isLoading ? (
          <Grid container spacing={3}>
            {[0, 1, 2, 3].map((item) => (
              <Grid key={item} size={{ xs: 12, sm: 6, md: 3 }}>
                <SkeletonProductCard />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={3}>
            {data?.products.slice(0, 4).map((product) => (
              <Grid key={product.id} size={{ xs: 12, sm: 6, md: 3 }}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
        )}
        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Button variant="text" component={Link} to="/termekek" endIcon={<ArrowForwardIcon />}>
            Összes termék
          </Button>
        </Box>
      </Container>

      <Box sx={{ bgcolor: "background.paper", py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ bgcolor: "grey.200", borderRadius: 3, height: 300, width: "100%" }} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h4" gutterBottom>
                A történetünk
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Kézzel készített gyógynövényes kenőcseink a természet erejét hozzák el Önnek. Minden
                termékünk gondosan válogatott, természetes összetevőkből készül, hagyományos receptúrák
                alapján.
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={3}>
          {TRUST_SIGNALS.map((signal) => (
            <Grid key={signal.label} size={{ xs: 12, sm: 4 }}>
              <Paper sx={{ p: 3, textAlign: "center" }}>
                <signal.icon sx={{ color: "primary.main", fontSize: 48 }} />
                <Typography variant="h6" sx={{ mt: 1 }}>
                  {signal.label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {signal.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};
